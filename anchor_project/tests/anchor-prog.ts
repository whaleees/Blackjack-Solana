import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { assert } from "chai";
import { AnchorProg } from "../target/types/anchor_prog";

const TABLE_SEED = Buffer.from("table_state2");
const VAULT_SEED = Buffer.from("vault2");

describe("blackjack-sol — full instruction coverage", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = anchor.workspace.AnchorProg as Program<AnchorProg>;
  const authority = (provider.wallet as anchor.Wallet).payer as Keypair; // casino/house

  let player: Keypair;

  // PDAs
  let tablePda: PublicKey;
  let vaultPda: PublicKey;

  // ---------- Helpers ----------
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const airdropChunked = async (to: PublicKey, solTotal: number) => {
    let remaining = solTotal;
    const chunk = 1;
    while (remaining > 0) {
      const thisChunk = Math.min(chunk, remaining);
      let retries = 3;
      let delay = 250;
      while (true) {
        try {
          const sig = await connection.requestAirdrop(
            to,
            Math.floor(thisChunk * LAMPORTS_PER_SOL)
          );
          await connection.confirmTransaction(sig, "confirmed");
          break;
        } catch (e) {
          if (--retries < 0) throw e;
          await sleep(delay);
          delay *= 2;
        }
      }
      remaining -= thisChunk;
    }
  };

  const lamports = (pk: PublicKey) =>
    connection.getBalance(pk, { commitment: "confirmed" });

  const pdaTable = () =>
    PublicKey.findProgramAddressSync([TABLE_SEED], program.programId)[0];

  const pdaVault = () =>
    PublicKey.findProgramAddressSync([VAULT_SEED], program.programId)[0];

  const rank = (card: number) => (card % 13) + 1; // 1..13 (A..K)

  const cardValue = (card: number) => {
    const r = rank(card);
    if (r === 1) return 11; // Ace as 11 first
    if (r >= 11) return 10; // J,Q,K
    return r;
  };

  const handTotal = (hand: number[]) => {
    let total = 0,
      aces = 0;
    for (const c of hand) {
      if (rank(c) === 1) aces++;
      total += cardValue(c);
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const isBlackjack = (hand: number[]) =>
    hand.length === 2 && handTotal(hand) === 21;

  const computePayout = (player: number[], dealer: number[], bet: number) => {
    const pt = handTotal(player);
    const dt = handTotal(dealer);
    if (pt > 21) return 0; // player bust
    if (dt > 21) return bet * 2; // dealer bust
    const pBJ = isBlackjack(player);
    const dBJ = isBlackjack(dealer);
    if (pBJ && !dBJ) return bet + Math.floor((bet * 3) / 2); // 3:2
    if (dBJ && !pBJ) return 0;
    if (pt > dt) return bet * 2;
    if (pt < dt) return 0;
    return bet; // push
  };

  const waitForBalance = async (pk: PublicKey, minLamports: number, timeoutMs = 20_000) => {
    const start = Date.now();
    while (true) {
      const bal = await lamports(pk);
      if (bal >= minLamports) return bal;
      if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for ${minLamports} lamports on ${pk.toBase58()}`);
      await sleep(500);
    }
  };


  before("prefund authority & one player; derive PDAs", async () => {
    await airdropChunked(authority.publicKey, 2);
    player = Keypair.generate();
    await airdropChunked(player.publicKey, 3);

    tablePda = pdaTable();
    vaultPda = pdaVault();
  });

  // ---------- create_table ----------
  it("create_table — happy path", async () => {
    await program.methods
      .tableCreate()
      .accounts({
        authority: authority.publicKey,
        table: tablePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const table = await program.account.table.fetch(tablePda);
    assert.equal(table.authority.toBase58(), authority.publicKey.toBase58());
    assert.equal(table.vault.toBase58(), vaultPda.toBase58());
  });

  it("create_table — unhappy: re-init same PDAs should fail", async () => {
    let threw = false;
    try {
      await program.methods
        .tableCreate()
        .accounts({
          authority: authority.publicKey,
          table: tablePda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    } catch (e: any) {
      threw = true;
      const msg = (e?.toString() || "").toLowerCase();
      assert.isTrue(
        msg.includes("already") ||
        msg.includes("use") ||
        msg.includes("initialized"),
        `unexpected error: ${e}`
      );
    }
    assert.isTrue(threw, "re-init should throw");
  });

  it("fund vault PDA (bankroll)", async () => {
    const want = 1 * LAMPORTS_PER_SOL;
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: vaultPda,
        lamports: want,
      })
    );
    await provider.sendAndConfirm!(tx, [authority]);
    await waitForBalance(vaultPda, want);
    const vbal = await lamports(vaultPda);
    assert.ok(vbal >= want, `vault not funded (have ${vbal}, want ${want})`);
  });


  // Helper to start a fresh game with a freshly initialized Game account.
  // newBet still requires the player's signature because it transfers the bet from player -> vault.
  const startGame = async (betLamports: number, p: Keypair = player) => {
    const game = Keypair.generate();
    await program.methods
      .newBet(new BN(betLamports))
      .accounts({
        player: p.publicKey,
        table: tablePda,
        vault: vaultPda,
        game: game.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([p, game])
      .rpc();
    return { player: p, game };
  };

  // ---------- new_bet ----------
  it("new_bet — happy path", async () => {
    const { player: p, game } = await startGame(0.05 * LAMPORTS_PER_SOL);
    const g = await program.account.game.fetch(game.publicKey);
    assert.equal(Object.keys(g.status as any)[0], "awaitingRandomness");

    const pbal = await lamports(p.publicKey);
    assert.ok(pbal <= 3 * LAMPORTS_PER_SOL - 0.05 * LAMPORTS_PER_SOL);
  });

  it("new_bet — unhappy: zero bet should fail (InvalidBet)", async () => {
    const game = Keypair.generate();
    let threw = false;
    try {
      await program.methods
        .newBet(new BN(0))
        .accounts({
          player: player.publicKey,
          table: tablePda,
          vault: vaultPda,
          game: game.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player, game])
        .rpc();
    } catch (e: any) {
      threw = true;
      assert.isTrue((e?.toString() || "").length > 0, "should throw");
    }
    assert.isTrue(threw, "zero bet must throw");
  });

  it("new_bet — unhappy: vault cannot cover max payout", async () => {
    const game = Keypair.generate();
    let threw = false;
    try {
      await program.methods
        .newBet(new BN(10 * LAMPORTS_PER_SOL))
        .accounts({
          player: player.publicKey,
          table: tablePda,
          vault: vaultPda,
          game: game.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player, game])
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "must fail if vault insufficient");
  });

  // ---------- dev_fulfill (random_card) ----------
  it("dev_fulfill — happy path", async () => {
    const { game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 17 + 23) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    const g = await program.account.game.fetch(game.publicKey);
    assert.equal(Object.keys(g.status as any)[0], "playerTurn");
    assert.equal(g.playerCards.length, 2);
    assert.equal(g.dealerCards.length, 2);
  });

  it("dev_fulfill — unhappy: already fulfilled", async () => {
    const { game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => i);

    await program.methods
      .randomCard(rand)
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    let threw = false;
    try {
      await program.methods
        .randomCard(rand)
        .accounts({
          table: tablePda,
          game: game.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "second fulfill must fail");
  });

  // ---------- player hit ----------
  it("player hit — happy path", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 31 + 5) % 256);

    await program.methods.randomCard(rand as number[]).accounts({ table: tablePda, game: game.publicKey }).rpc();

    const before = await program.account.game.fetch(game.publicKey);
    const prevLen = before.playerCards.length;

    await program.methods.hitPlayer().accounts({ table: tablePda, game: game.publicKey, player: p.publicKey }).rpc();

    const after = await program.account.game.fetch(game.publicKey);
    assert.equal(after.playerCards.length, prevLen + 1);

    assert.include(["playerTurn", "dealerTurn", "settled"], Object.keys(after.status as any)[0]);
  });


  it("player hit — unhappy: not PlayerTurn (before fulfill) should fail", async () => {
    const game = Keypair.generate();

    await program.methods
      .newBet(new BN(0.02 * LAMPORTS_PER_SOL))
      .accounts({
        player: player.publicKey,
        table: tablePda,
        vault: vaultPda,
        game: game.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player, game])
      .rpc();

    let threw = false;
    try {
      await program.methods
        .hitPlayer()
        .accounts({
          table: tablePda,
          game: game.publicKey,
          player: player.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "hit during AwaitingRandomness must throw");
  });

  it("player hit — unhappy: after Settled", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => i);

    await program.methods
      .randomCard(rand)
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    await program.methods
      .standPlayer()
      .accounts({
        table: tablePda,
        game: game.publicKey,
        player: p.publicKey,
      })
      .rpc();

    await program.methods
      .standDealer()
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    let threw = false;
    try {
      await program.methods
        .hitPlayer()
        .accounts({
          table: tablePda,
          game: game.publicKey,
          player: p.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "hit after Settled must fail");
  });

  // ---------- player stand ----------
  it("player stand — happy path", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 13 + 7) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    await program.methods
      .standPlayer()
      .accounts({
        table: tablePda,
        game: game.publicKey,
        player: p.publicKey,
      })
      .rpc();

    const afterStand = await program.account.game.fetch(game.publicKey);
    assert.equal(Object.keys(afterStand.status as any)[0], "dealerTurn");
  });

  it("stand — unhappy: not PlayerTurn (before fulfill) should fail", async () => {
    const game = Keypair.generate();

    await program.methods
      .newBet(new BN(0.02 * LAMPORTS_PER_SOL))
      .accounts({
        player: player.publicKey,
        table: tablePda,
        vault: vaultPda,
        game: game.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player, game])
      .rpc();

    let threw = false;
    try {
      await program.methods
        .standPlayer()
        .accounts({
          table: tablePda,
          game: game.publicKey,
          player: player.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "stand during AwaitingRandomness must throw");
  });

  // ---------- dealer hit ----------
  it("hit_dealer — happy path", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 7 + 11) % 256);

    await program.methods.randomCard(rand as number[]).accounts({ table: tablePda, game: game.publicKey }).rpc();

    await program.methods.standPlayer().accounts({ table: tablePda, game: game.publicKey, player: p.publicKey }).rpc();

    const before = await program.account.game.fetch(game.publicKey);
    assert.equal(Object.keys(before.status as any)[0], "dealerTurn");

    await program.methods.hitDealer().accounts({ table: tablePda, game: game.publicKey }).rpc();

    const after = await program.account.game.fetch(game.publicKey);
    assert.ok(after.dealerCards.length > before.dealerCards.length, "dealer should have drawn");

    assert.include(["dealerTurn", "settled"], Object.keys(after.status as any)[0]);
  });


  it("hit_dealer — unhappy: wrong state", async () => {
    const { game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 5 + 17) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    // still PlayerTurn here
    let threw = false;
    try {
      await program.methods
        .hitDealer()
        .accounts({
          table: tablePda,
          game: game.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "dealer cannot hit outside DealerTurn");
  });

  // ---------- dealer stand ----------
  it("stand dealer — happy path", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 13 + 19) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    // give dealer the turn
    await program.methods
      .standPlayer()
      .accounts({
        table: tablePda,
        game: game.publicKey,
        player: p.publicKey,
      })
      .rpc();

    await program.methods
      .standDealer()
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    const after = await program.account.game.fetch(game.publicKey);
    assert.include(
      ["settled"],
      Object.keys(after.status as any)[0]
    );
  });

  it("stand_dealer — unhappy: wrong state", async () => {
    const { game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 23 + 7) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    // still PlayerTurn
    let threw = false;
    try {
      await program.methods
        .standDealer()
        .accounts({
          table: tablePda,
          game: game.publicKey,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "dealer cannot stand outside DealerTurn");
  });

  // ---------- settle ----------
  it("settle — happy path", async () => {
    const { player: p, game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const betLamports = 0.02 * LAMPORTS_PER_SOL;
    const rand = Array.from({ length: 32 }, (_, i) => (i * 23 + 17) % 256);

    await program.methods.randomCard(rand as number[]).accounts({ table: tablePda, game: game.publicKey }).rpc();

    await program.methods.standPlayer().accounts({ table: tablePda, game: game.publicKey, player: p.publicKey }).rpc();

    const vBefore = await lamports(vaultPda);
    const pBefore = await lamports(p.publicKey);

    await program.methods.end().accounts({
      table: tablePda,
      game: game.publicKey,
      vault: vaultPda,
      player: p.publicKey,
      systemProgram: SystemProgram.programId,
    }).rpc();

    const after = await program.account.game.fetch(game.publicKey);
    assert.equal(Object.keys(after.status as any)[0], "closed");

    const vAfter = await lamports(vaultPda);
    const pAfter = await lamports(p.publicKey);

    const payout = computePayout(after.playerCards as number[], after.dealerCards as number[], betLamports);
    assert.strictEqual(pAfter, pBefore + payout, "player balance delta mismatch");
    assert.strictEqual(vAfter, vBefore - payout, "vault balance delta mismatch");
  });


  it("settle — unhappy: wrong state (PlayerTurn) should fail", async () => {
    const { game } = await startGame(0.02 * LAMPORTS_PER_SOL);
    const rand = Array.from({ length: 32 }, (_, i) => (i * 19 + 3) % 256);

    await program.methods
      .randomCard(rand as number[])
      .accounts({
        table: tablePda,
        game: game.publicKey,
      })
      .rpc();

    let threw = false;
    try {
      await program.methods
        .end()
        .accounts({
          table: tablePda,
          game: game.publicKey,
          vault: vaultPda,
          player: player.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "settle during PlayerTurn must throw");
  });
});

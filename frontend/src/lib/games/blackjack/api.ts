import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { AnchorProg } from "@/types/anchor_prog";
import { fetchGame, GameAccountShape } from "@/lib/actions/blackjack";
import { randomBytes } from "@/lib/random";

export async function apiNewBet(
    program: anchor.Program<AnchorProg>,
    player: web3.PublicKey,
    betSol: number
): Promise<{ gamePubkey: web3.PublicKey; sig: string }> {
    const gameKp = web3.Keypair.generate();
    const lamports = new anchor.BN(Math.round((betSol || 0) * 1_000_000_000));

    const sig = await program.methods
        .newBet(lamports)
        .accounts({ player, game: gameKp.publicKey })
        .signers([gameKp])
        .rpc();

    return { gamePubkey: gameKp.publicKey, sig };
}

export async function apiDevRandomFulfill(
    program: anchor.Program<AnchorProg>,
    game: web3.PublicKey
): Promise<string> {
    const randomness = randomBytes(32);
    return program.methods
        .randomCard(Array.from(randomness))
        .accounts({ game })
        .rpc();
}

export async function apiHit(
    program: anchor.Program<AnchorProg>,
    game: web3.PublicKey,
    player: web3.PublicKey
): Promise<string> {
    return program.methods
        .hitPlayer()
        .accounts({ game, player })
        .rpc();
}

export async function apiStand(
    program: anchor.Program<AnchorProg>,
    game: web3.PublicKey,
    player: web3.PublicKey
): Promise<string> {
    return program.methods
        .standPlayer()
        .accounts({ game, player })
        .rpc();
}

export async function apiEnd(
    program: anchor.Program<AnchorProg>,
    game: web3.PublicKey,
    player: web3.PublicKey
): Promise<string> {
    return program.methods
        .end()
        .accounts({ game, player })
        .rpc();
}

export async function apiFetchGame(
    program: anchor.Program<AnchorProg>,
    game: web3.PublicKey
): Promise<GameAccountShape> {
    return fetchGame(program, game);
}

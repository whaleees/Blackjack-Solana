"use client";

import { useEffect, useMemo, useState } from "react";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/useProgram";
import type { AnchorProg } from "@/types/anchor_prog";
import { cardsToText } from "@/lib/cards";
import { randomBytes } from "@/lib/random";
import { fetchGame, GameAccountShape, anchorEnumToLabel } from "@/lib/actions/blackjack";


function handTotal(cards: number[]) {
    let total = 0, aces = 0;
    for (const c of cards) {
        const r = (c % 13) + 1;
        if (r === 1) { total += 11; aces++; }
        else if (r >= 11) total += 10;
        else total += r;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}
function isBJ(cards: number[]) {
    return cards.length === 2 && handTotal(cards) === 21;
}
function computeOutcomeLower(player: number[], dealer: number[]): "playerwin" | "dealerwin" | "push" {
    const pt = handTotal(player);
    const dt = handTotal(dealer);
    const pBJ = isBJ(player), dBJ = isBJ(dealer);

    if (pt > 21) return "dealerwin";
    if (dt > 21) return "playerwin";
    if (pBJ && !dBJ) return "playerwin";
    if (dBJ && !pBJ) return "dealerwin";
    if (pt > dt) return "playerwin";
    if (pt < dt) return "dealerwin";
    return "push";
}

function fmtSolLamports(lamports: bigint) {
    const sol = Number(lamports) / 1_000_000_000;
    return (Math.sign(sol) >= 0 ? "+" : "−") + Math.abs(sol).toLocaleString(undefined, { maximumFractionDigits: 9 });
}

function computePayoutLamports(
    player: number[],
    dealer: number[],
    betLamports: bigint
): bigint {
    const pt = handTotal(player);
    const dt = handTotal(dealer);
    const pBJ = isBJ(player);
    const dBJ = isBJ(dealer);

    if (pt > 21) return 0n;
    if (dt > 21) return betLamports * 2n;

    if (pBJ && !dBJ) return betLamports + (betLamports * 3n) / 2n;
    if (dBJ && !pBJ) return 0n;

    if (pt > dt) return betLamports * 2n;
    if (pt < dt) return 0n;
    return betLamports; // push
}

export default function BlackjackTable() {
    const GAME_KEY = "blackjack.currentGame";
    const { program, loading, error } = useProgram<AnchorProg>();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [currentGame, setCurrentGame] = useState<web3.PublicKey | null>(null);
    const [gameAcc, setGameAcc] = useState<GameAccountShape | null>(null);
    const [betSol, setBetSol] = useState<string>("1");
    const [lastSig, setLastSig] = useState<string | null>(null);

    const statusRaw = gameAcc ? anchorEnumToLabel(gameAcc.status) : "unknown";
    const statusKey = statusRaw.toLowerCase();

    const outcomeKey =
        ["playerwin", "dealerwin", "push"].includes(statusKey)
            ? (statusKey as "playerwin" | "dealerwin" | "push")
            : (statusKey === "closed" && gameAcc
                ? computeOutcomeLower(gameAcc.playerCards, gameAcc.dealerCards)
                : null);

    const canHit = statusKey === "playerturn";
    const canStand = statusKey === "playerturn";

    const roundOver =
        ["closed", "playerwin", "dealerwin", "push"].includes(statusKey);

    function dealerText() {
        const cards = gameAcc?.dealerCards || [];
        if (cards.length === 0) return "—";

        if (roundOver) {
            return cardsToText(cards);
        }

        // Show only the first dealer card; mask the rest
        const shown = cardsToText([cards[0]]);
        const hiddenCount = Math.max(0, cards.length - 1);
        const hidden = hiddenCount > 0 ? " " + "🂠".repeat(hiddenCount) : "";
        return shown + hidden; // e.g., "K♣ 🂠"
    }


    // PDAs
    const [tablePda] = useMemo(
        () =>
            program
                ? web3.PublicKey.findProgramAddressSync([Buffer.from("table_state2")], program.programId)
                : [web3.PublicKey.default],
        [program]
    );

    const [vaultPda] = useMemo(
        () =>
            program
                ? web3.PublicKey.findProgramAddressSync([Buffer.from("vault2")], program.programId)
                : [web3.PublicKey.default],
        [program]
    );

    // wrap tx runner
    const run = async (f: () => Promise<string | void>) => {
        const sig = await f();
        if (typeof sig === "string") {
            setLastSig(sig);
            await connection.confirmTransaction(sig, "confirmed");
        }
    };

    // Restore a game from URL/localStorage
    useEffect(() => {
        if (!program) return;
        const fromUrl = new URLSearchParams(window.location.search).get("game");
        const restored: string | null = fromUrl ?? localStorage.getItem(GAME_KEY);
        if (!restored) return;

        try {
            const g = new web3.PublicKey(restored);
            setCurrentGame(g);
            fetchGame(program, g).then(setGameAcc).catch(console.error);
        } catch {
            localStorage.removeItem(GAME_KEY);
        }
    }, [program]);

    // Auto-finish: if DealerTurn or Settled -> call end() (your on-chain end() will draw for dealer if needed)
    useEffect(() => {
        if (!program || !currentGame || !publicKey) return;
        if (statusKey !== "dealerturn" && statusKey !== "settled") return;

        (async () => {
            try {
                const sig = await program.methods
                    .end()
                    .accounts({
                        game: currentGame,
                        player: publicKey,          // payout recipient
                    })
                    .rpc();
                setLastSig(sig);
                const acc = await fetchGame(program, currentGame);
                setGameAcc(acc);
            } catch (e) {
                console.error("auto end() failed:", e);
            }
        })();
    }, [statusKey, program, currentGame, publicKey, tablePda, vaultPda]);

    // Actions
    const startGame = async () => {
        if (!program || !publicKey) return;
        const gameKp = web3.Keypair.generate();
        const lamports = new anchor.BN(Math.round((parseFloat(betSol || "0") || 0) * 1_000_000_000));

        // newBet (payer = player)
        await run(async () =>
            program.methods
                .newBet(lamports)
                .accounts({
                    player: publicKey,
                    game: gameKp.publicKey,
                })
                .signers([gameKp])
                .rpc()
        );

        // persist handle
        setCurrentGame(gameKp.publicKey);
        localStorage.setItem(GAME_KEY, gameKp.publicKey.toBase58());
        const url = new URL(window.location.href);
        url.searchParams.set("game", gameKp.publicKey.toBase58());
        window.history.replaceState(null, "", url);

        // fulfill randomness (dev) — your DevFulfill requires { authority, table, game }
        const randomness = randomBytes(32);
        await run(async () =>
            program.methods
                .randomCard(Array.from(randomness))
                .accounts({
                    game: gameKp.publicKey,
                })
                .rpc()
        );

        const acc = await fetchGame(program, gameKp.publicKey);
        setGameAcc(acc);
    };

    const hit = async () => {
        if (!program || !publicKey || !currentGame) return;
        await run(async () =>
            program.methods
                .hitPlayer()
                .accounts({
                    game: currentGame,
                    player: publicKey,
                })
                .rpc()
        );
        const acc = await fetchGame(program, currentGame);
        setGameAcc(acc);
    };

    const stand = async () => {
        if (!program || !publicKey || !currentGame) return;
        await run(async () =>
            program.methods
                .standPlayer()
                .accounts({
                    game: currentGame,
                    player: publicKey,
                })
                .rpc()
        );
        const acc = await fetchGame(program, currentGame);
        setGameAcc(acc);
    };

    const resetGame = () => {
        localStorage.removeItem(GAME_KEY);
        const url = new URL(window.location.href);
        url.searchParams.delete("game");
        window.history.replaceState(null, "", url);
        setCurrentGame(null);
        setGameAcc(null);
    };

    // Payout banner (after closed or we derived an outcome)
    let payoutStr: string | null = null;
    if (gameAcc && (["playerwin", "dealerwin", "push"].includes(statusKey) || statusKey === "closed")) {
        const bet = BigInt(gameAcc.betAmount.toString());
        const payout = computePayoutLamports(gameAcc.playerCards, gameAcc.dealerCards, bet);
        const net = payout - bet;
        payoutStr = fmtSolLamports(net);
    }

    // UI
    if (loading) return <main className="p-6">Loading…</main>;

    return (
        <main className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Blackjack</h1>
            {!publicKey && <p className="text-red-600">Connect your wallet to play.</p>}
            {error && <p className="text-red-600">{String(error)}</p>}

            {/* Start / Bet */}
            {!currentGame || statusKey === "closed" ? (
                <div className="rounded-xl border p-4 space-y-3">
                    <div className="font-semibold">Start a new game</div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm opacity-70">Bet (SOL)</label>
                        <input
                            value={betSol}
                            onChange={(e) => setBetSol(e.target.value)}
                            className="px-3 py-2 rounded-lg border bg-black/20"
                            placeholder="1.0"
                            inputMode="decimal"
                        />
                        <button
                            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
                            disabled={!program || !publicKey || !betSol || Number.isNaN(parseFloat(betSol))}
                            onClick={startGame}
                        >
                            Start game
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Current game panel */}
            {currentGame && (
                <div className="mt-6 rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400 break-all">
                            Game: {currentGame.toBase58()}
                        </div>
                        <button className="text-sm underline opacity-70" onClick={resetGame}>
                            Reset
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                            <div className="font-semibold mb-1">Player</div>
                            <div className="text-lg">{cardsToText(gameAcc?.playerCards || []) || "—"}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="font-semibold mb-1">Dealer</div>
                            <div className="text-lg">{dealerText()}</div>
                        </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                            Bet: {gameAcc ? Number(gameAcc.betAmount.toString()) / 1_000_000_000 : 0} SOL
                        </span>
                        <span>Status: {statusRaw}</span>
                        <span>RNG cursor: {gameAcc?.rngCursor ?? "-"}</span>
                    </div>

                    {/* Play controls */}
                    <div className="mt-4 flex gap-3">
                        <button
                            className="px-5 py-2 rounded-xl bg-black text-white disabled:opacity-40"
                            disabled={!canHit}
                            onClick={hit}
                        >
                            Hit
                        </button>
                        <button
                            className="px-5 py-2 rounded-xl bg-black text-white disabled:opacity-40"
                            disabled={!canStand}
                            onClick={stand}
                        >
                            Stand
                        </button>
                    </div>

                    {/* Last tx */}
                    {lastSig && (
                        <div className="mt-4 text-xs text-gray-500 break-all">
                            Last tx: {lastSig}
                        </div>
                    )}
                </div>
            )}

            {outcomeKey && payoutStr && (
                <div className="mt-3 rounded-lg border px-4 py-3 bg-white/5 font-semibold flex items-center gap-3">
                    <span>
                        {outcomeKey === "playerwin" && "🎉 Player wins!"}
                        {outcomeKey === "dealerwin" && "💀 Dealer wins!"}
                        {outcomeKey === "push" && "🤝 Push!"}
                    </span>
                    <span
                        className={
                            outcomeKey === "playerwin" ? "text-green-400" :
                                outcomeKey === "dealerwin" ? "text-red-400" : "opacity-70"
                        }
                    >
                        {payoutStr} SOL
                    </span>
                </div>
            )}
        </main>
    );
}

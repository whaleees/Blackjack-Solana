"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/useProgram";
import type { AnchorProg } from "@/types/anchor_prog";
import { anchorEnumToLabel, GameAccountShape } from "@/lib/actions/blackjack";

import type { Outcome, PayoutInfo, StatusKey } from "./types";
import {
    computeOutcomeLower,
    computePayoutLamports,
    fmtSolLamports,
    LAMPORTS_PER_SOL,
    handTotal,
} from "./logic";
import {
    apiDevRandomFulfill,
    apiEnd,
    apiFetchGame,
    apiHit,
    apiNewBet,
    apiStand,
} from "./api";

const GAME_KEY = "blackjack.currentGame";

export function useBlackjackGame() {
    const { program, loading, error } = useProgram<AnchorProg>();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [currentGame, setCurrentGame] = useState<web3.PublicKey | null>(null);
    const [gameAcc, setGameAcc] = useState<GameAccountShape | null>(null);
    const [betSol, setBetSol] = useState<string>("1");
    const [lastSig, setLastSig] = useState<string | null>(null);

    // NEW: only auto-end when we actually want the dealer to play out
    const [dealerPhaseRequested, setDealerPhaseRequested] = useState(false);

    const statusRaw = gameAcc ? anchorEnumToLabel(gameAcc.status) : "unknown";
    const statusKey: StatusKey = (statusRaw?.toLowerCase() as StatusKey) || "unknown";

    const outcomeKey: Outcome | null = useMemo(() => {
        if (statusKey === "playerwin" || statusKey === "dealerwin" || statusKey === "push") return statusKey;
        if (statusKey === "closed" && gameAcc) {
            return computeOutcomeLower(gameAcc.playerCards, gameAcc.dealerCards);
        }
        return null;
    }, [statusKey, gameAcc]);

    const canHit = statusKey === "playerturn";
    const canStand = statusKey === "playerturn";
    const roundOver = ["closed", "playerwin", "dealerwin", "push"].includes(statusKey);

    const payoutInfo: PayoutInfo | null = useMemo(() => {
        if (!gameAcc) return null;
        if (!(roundOver || statusKey === "closed")) return null;
        const bet = BigInt(gameAcc.betAmount.toString());
        const payout = computePayoutLamports(gameAcc.playerCards, gameAcc.dealerCards, bet);
        const net = payout - bet;
        return {
            payoutLamports: payout,
            netLamports: net,
            netFormatted: fmtSolLamports(net),
        };
    }, [gameAcc, roundOver, statusKey]);

    // Restore a game from URL/localStorage
    useEffect(() => {
        if (!program) return;
        const fromUrl = new URLSearchParams(window.location.search).get("game");
        const restored = fromUrl ?? localStorage.getItem(GAME_KEY);
        if (!restored) return;
        try {
            const g = new web3.PublicKey(restored);
            setCurrentGame(g);
            apiFetchGame(program, g).then(setGameAcc).catch(console.error);
        } catch {
            localStorage.removeItem(GAME_KEY);
        }
    }, [program]);

    // Auto-finish dealer turn — gated
    useEffect(() => {
        if (!program || !currentGame || !publicKey) return;

        // Only allow auto-end if:
        // 1) status already "settled" (dealer finished), OR
        // 2) status "dealerturn" AND (user pressed Stand OR player total >= 21)
        const playerTotal = gameAcc ? handTotal(gameAcc.playerCards) : 0;
        const shouldAutoEnd =
            statusKey === "settled" ||
            (statusKey === "dealerturn" && (dealerPhaseRequested || playerTotal >= 21));

        if (!shouldAutoEnd) return;

        (async () => {
            try {
                const sig = await apiEnd(program, currentGame, publicKey);
                setLastSig(sig);
                const acc = await apiFetchGame(program, currentGame);
                setGameAcc(acc);
                setDealerPhaseRequested(false); // consume the flag
            } catch (e) {
                console.error("auto end() failed:", e);
            }
        })();
    }, [statusKey, program, currentGame, publicKey, dealerPhaseRequested, gameAcc]);

    const confirmSig = useCallback(
        async (sig: string) => {
            setLastSig(sig);
            await connection.confirmTransaction(sig, "confirmed");
        },
        [connection],
    );

    const startGame = useCallback(async () => {
        if (!program || !publicKey) return;
        const bet = parseFloat(betSol || "0");

        const { gamePubkey, sig } = await apiNewBet(program, publicKey, bet);
        await confirmSig(sig);

        setDealerPhaseRequested(false);

        setCurrentGame(gamePubkey);
        localStorage.setItem(GAME_KEY, gamePubkey.toBase58());
        const url = new URL(window.location.href);
        url.searchParams.set("game", gamePubkey.toBase58());
        window.history.replaceState(null, "", url);

        const fulfillSig = await apiDevRandomFulfill(program, gamePubkey);
        await confirmSig(fulfillSig);

        const acc = await apiFetchGame(program, gamePubkey);
        setGameAcc(acc);
    }, [program, publicKey, betSol, confirmSig]);

    const hit = useCallback(async () => {
        if (!program || !publicKey || !currentGame) return;
        const sig = await apiHit(program, currentGame, publicKey);
        await confirmSig(sig);
        const acc = await apiFetchGame(program, currentGame);
        setGameAcc(acc);
        // keep dealerPhaseRequested as-is; user hasn't stood yet
    }, [program, publicKey, currentGame, confirmSig]);

    const stand = useCallback(async () => {
        if (!program || !publicKey || !currentGame) return;
        setDealerPhaseRequested(true); // explicitly enter dealer phase
        const sig = await apiStand(program, currentGame, publicKey);
        await confirmSig(sig);
        const acc = await apiFetchGame(program, currentGame);
        setGameAcc(acc);
    }, [program, publicKey, currentGame, confirmSig]);

    const resetGame = useCallback(() => {
        localStorage.removeItem(GAME_KEY);
        const url = new URL(window.location.href);
        url.searchParams.delete("game");
        window.history.replaceState(null, "", url);
        setCurrentGame(null);
        setGameAcc(null);
        setDealerPhaseRequested(false);
    }, []);

    return {
        // meta
        loading,
        error,
        publicKey,

        // state
        betSol,
        setBetSol,
        currentGame,
        gameAcc,
        statusRaw,
        statusKey,
        outcomeKey,
        canHit,
        canStand,
        roundOver,
        lastSig,
        payoutInfo,

        // actions
        startGame,
        hit,
        stand,
        resetGame,

        // helpers
        solFromLamports: (lamports: bigint | number) =>
            Number(lamports) / LAMPORTS_PER_SOL,
    };
}

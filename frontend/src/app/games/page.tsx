// src/app/games/page.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useBlackjackGame } from "@/lib/games/blackjack/useBlackjackGame";
import CasinoTable from "@/components/games/CasinoTable";
import CardHand from "@/components/games/CardHand";
import ChipRail from "@/components/games/ChipRail";
import BetCircle from "@/components/games/BetCircle";
import BetEditor from "@/components/games/BetEditor";

// helpers
const round01 = (n: number) => Math.max(0, Math.round(n * 10) / 10);
const sum = (arr: number[]) => round01(arr.reduce((a, b) => a + b, 0));

export default function BlackjackTable() {
    const {
        publicKey, error, currentGame, gameAcc,
        statusRaw, statusKey, canHit, canStand,
        lastSig, outcomeKey, payoutInfo,
        startGame, hit, stand, resetGame,
        setBetSol,
    } = useBlackjackGame();

    // ---- chip stack (LIFO) ----
    const [chipStack, setChipStack] = useState<number[]>([]);
    const total = useMemo(() => sum(chipStack), [chipStack]);
    const syncBet = (n: number) => setBetSol(String(round01(n)));

    const addChip = (d: number) => setChipStack(s => { const n = [...s, d]; syncBet(sum(n)); return n; });
    const popChip = () => setChipStack(s => { if (!s.length) return s; const n = s.slice(0, -1); syncBet(sum(n)); return n; });
    const subChip = (d: number) => setChipStack(s => {
        const i = [...s].lastIndexOf(d); if (i < 0) return s;
        const n = s.slice(0, i).concat(s.slice(i + 1)); syncBet(sum(n)); return n;
    });
    const clearChips = () => { setChipStack([]); syncBet(0); };

    // counts (for editor)
    const counts = useMemo(() => {
        const c: Record<number, number> = { 0.1: 0, 0.5: 0, 1: 0, 5: 0, 10: 0, 25: 0 };
        chipStack.forEach(d => { c[d] = (c[d] ?? 0) + 1; });
        return c;
    }, [chipStack]);

    // game state
    const dealerCards = gameAcc?.dealerCards ?? [];
    const playerCards = gameAcc?.playerCards ?? [];
    const inDealerPhase = statusKey === "dealerturn" || statusKey === "settled";
    const roundOver = ["closed", "playerwin", "dealerwin", "push"].includes(statusKey);
    const canStartNew = !currentGame || statusKey === "closed";

    // Deal
    const handleDeal = async () => {
        if (!publicKey || !canStartNew || total <= 0) return;
        await startGame();
    };

    // ----- stack quick editor (open via long-press or double-click) -----
    const [editOpen, setEditOpen] = useState(false);
    const lpTimer = useRef<number | null>(null);

    const onStackPointerDown = () => {
        if (!canStartNew) return;
        lpTimer.current = window.setTimeout(() => { setEditOpen(true); lpTimer.current = null; }, 450);
    };
    const onStackPointerUp = () => {
        if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
    };

    return (
        <main className="w-full">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-2xl font-bold mb-3">Blackjack</h1>
                {error && <p className="text-red-500 text-sm mb-3">{String(error)}</p>}
            </div>

            <div className="px-0">
                <CasinoTable
                    className="min-h-[680px] lg:min-h-[760px]"
                    header={
                        <>
                            <div className="text-xs text-white/60 break-all">
                                Game: {currentGame ? currentGame.toBase58() : "—"}
                            </div>
                            <button className="text-sm underline opacity-80" onClick={resetGame}>Reset</button>
                        </>
                    }

                    topArea={
                        dealerCards.length
                            ? <CardHand cards={dealerCards} revealAll={inDealerPhase || roundOver} startDelayMs={80} />
                            : <div className="text-white/60">—</div>
                    }

                    bottomArea={
                        <>
                            {playerCards.length
                                ? <CardHand cards={playerCards} revealAll startDelayMs={60} />
                                : <div className="text-white/60">—</div>
                            }

                            {!canStartNew && (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        className="px-5 py-2 rounded-xl bg-white/10 text-white disabled:opacity-40"
                                        disabled={!canHit || inDealerPhase || roundOver}
                                        onClick={hit}
                                    >Hit</button>
                                    <button
                                        className="px-5 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40"
                                        disabled={!canStand || inDealerPhase || roundOver}
                                        onClick={stand}
                                    >Stand</button>
                                </div>
                            )}

                            <div className="mt-3 text-xs text-white/60 flex gap-4 flex-wrap">
                                <span>Bet: {canStartNew ? total : (gameAcc ? Number(gameAcc.betAmount.toString()) / 1_000_000_000 : 0)} SOL</span>
                                <span>Status: {statusRaw}</span>
                                <span>RNG cursor: {gameAcc?.rngCursor ?? "—"}</span>
                            </div>
                        </>
                    }

                    // center: click pops; long-press/double-click opens editor
                    centerArea={
                        <div
                            onPointerDown={onStackPointerDown}
                            onPointerUp={onStackPointerUp}
                            onDoubleClick={() => setEditOpen(true)}
                        >
                            <BetCircle stack={chipStack} amount={total} onPop={() => canStartNew && popChip()} />
                        </div>
                    }

                    footer={
                        <div className="relative flex flex-col items-center gap-10 mt-4">
                            {canStartNew && (
                                <button
                                    className="px-8 py-2 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-900/30 active:scale-95 transition"
                                    disabled={!publicKey || total <= 0}
                                    onClick={handleDeal}
                                    title={total <= 0 ? "Add chips to bet" : "Deal"}
                                >
                                    Deal
                                </button>
                            )}

                            <ChipRail disabled={!canStartNew} onAdd={addChip} onSub={subChip} onClear={clearChips} />

                            {/* Quick Edit popover */}
                            <BetEditor
                                open={editOpen}
                                onClose={() => setEditOpen(false)}
                                counts={counts}
                                onAdd={(d) => addChip(d)}
                                onSub={(d) => subChip(d)}
                            />

                            {lastSig && (
                                <div className="mt-3 text-xs text-white/60 break-all">Last tx: {lastSig}</div>
                            )}

                            {outcomeKey && payoutInfo && (
                                <div className={[
                                    "mt-3 rounded-lg border px-4 py-3 bg-white/5 font-semibold flex items-center gap-3",
                                    outcomeKey === "playerwin" ? "text-green-400"
                                        : outcomeKey === "dealerwin" ? "text-red-400" : "opacity-80",
                                ].join(" ")}>
                                    <span>
                                        {outcomeKey === "playerwin" && "🎉 Player wins!"}
                                        {outcomeKey === "dealerwin" && "💀 Dealer wins!"}
                                        {outcomeKey === "push" && "🤝 Push!"}
                                    </span>
                                    <span>{payoutInfo.netFormatted} SOL</span>
                                </div>
                            )}
                        </div>
                    }
                />
            </div>
        </main>
    );
}

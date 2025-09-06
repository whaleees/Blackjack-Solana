"use client";
import { useMemo } from "react";

type Props = {
    betSol: string;
    setBetSol: (v: string) => void;
    onStart: () => void;
    disabled?: boolean;
    walletConnected?: boolean;
    balanceSol?: number; // optional to show helper
};

export default function StartGameForm({
    betSol, setBetSol, onStart, disabled, walletConnected, balanceSol
}: Props) {
    const valid = useMemo(() => {
        const n = parseFloat(betSol);
        return Number.isFinite(n) && n > 0;
    }, [betSol]);

    return (
        <div className="rounded-xl border p-5 bg-white/5">
            <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">Start a new game</div>
                {typeof balanceSol === "number" && (
                    <div className="text-xs text-gray-400">Balance: {balanceSol.toFixed(4)} SOL</div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <label className="text-sm opacity-70 w-24 pt-2">Bet (SOL)</label>
                <div className="flex-1 flex gap-2">
                    <input
                        value={betSol}
                        onChange={(e) => setBetSol(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border bg-black/20 outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="1.00"
                        inputMode="decimal"
                    />
                    <button
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                        disabled={disabled || !walletConnected || !valid}
                        onClick={onStart}
                    >
                        Start game
                    </button>
                </div>
            </div>

            {!walletConnected && (
                <p className="text-amber-400 text-xs mt-3">Connect your wallet to play.</p>
            )}
        </div>
    );
}

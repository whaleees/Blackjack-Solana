"use client";
import { Chip } from "@/components/games/Chips";

type ChipColor = "blue" | "red" | "green" | "black" | "purple" | "gold";
const COLOR: Record<number, ChipColor> = {
    0.1: "gold", 0.5: "gold", 1: "blue", 5: "red", 10: "green", 25: "purple",
};
const DENOMS = [0.1, 0.5, 1, 5, 10, 25];

export default function BetEditor({
    open, onClose, counts, onAdd, onSub,
}: {
    open: boolean;
    onClose: () => void;
    counts: Record<number, number>;
    onAdd: (d: number) => void;
    onSub: (d: number) => void;
}) {
    if (!open) return null;

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            {/* panel */}
            <div className="relative rounded-2xl border border-white/10 bg-black/70 p-4 shadow-xl w-[min(520px,92vw)]">
                <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/90">Edit bet</div>
                    <button
                        onClick={onClose}
                        className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                        Done
                    </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {DENOMS.map((d) => {
                        const n = counts[d] ?? 0;
                        return (
                            <div key={d} className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <Chip denom={d} color={COLOR[d]} size={48} />
                                    {n > 0 && (
                                        <span className="absolute -right-2 -top-2 text-[11px] px-1.5 py-0.5 rounded-full bg-white/15 border border-white/20">
                                            ×{n}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSub(d)}
                                        disabled={n === 0}
                                        className="w-7 h-7 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                                        title={`Remove one ${d} SOL`}
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => onAdd(d)}
                                        className="w-7 h-7 rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                                        title={`Add one ${d} SOL`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

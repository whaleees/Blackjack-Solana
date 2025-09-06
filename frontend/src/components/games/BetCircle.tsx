"use client";
import { Chip } from "@/components/games/Chips";

type ChipColor = "blue" | "red" | "green" | "black" | "purple" | "gold";
const CHIP_COLOR: Record<number, ChipColor> = {
    0.1: "gold",
    0.5: "gold",
    1: "blue",
    5: "red",
    10: "green",
    25: "purple",
};

export default function BetCircle({
    stack,
    amount,
    onPop,
    size = 120,
    maxVisible = 7,
    liftPerChip = 8,
}: {
    stack: number[];
    amount: number;
    onPop?: () => void;
    size?: number;
    maxVisible?: number;
    liftPerChip?: number;
}) {
    const chipSize = Math.round(size * 0.58);
    const visible = stack.slice(-maxVisible);

    return (
        <button
            type="button"
            onClick={() => amount > 0 && onPop?.()}
            onContextMenu={(e) => e.preventDefault()}
            title={amount > 0 ? "Remove last chip" : "No chips"}
            aria-label="Bet stack"
            className="
        relative flex items-center justify-center select-none
        rounded-full border border-white/20
        bg-gradient-to-b from-indigo-600/25 to-indigo-900/25
        shadow-[0_20px_60px_-20px_rgba(0,0,0,.7)]
        active:scale-95 transition
      "
            style={{ width: size, height: size }}
        >
            {/* stacked chips */}
            <div
                className="relative w-[72px] h-[72px]"
            >
                {visible.map((d, i) => {
                    const z = i + 1;
                    const lift = (visible.length - i - 1) * liftPerChip;
                    const isTop = i === visible.length - 1;
                    return (
                        <div
                            key={`${i}-${d}`}
                            className="absolute left-1/2 top-1/2"
                            style={{ transform: `translate(-50%,-50%) translateY(-${lift}px)`, zIndex: z }}
                        >
                            {isTop ? (
                                <button onClick={onPop} title="Remove top chip">
                                    <Chip denom={d} color={CHIP_COLOR[d] ?? "purple"} size={chipSize} />
                                </button>
                            ) : (
                                <Chip denom={d} color={CHIP_COLOR[d] ?? "purple"} size={chipSize} />
                            )}
                        </div>
                    );
                })}
            </div>


            {/* total label */}
            <span
                className="absolute text-xs font-medium text-white/80"
                style={{ bottom: -(Math.max(14, Math.round(size * 0.12))) }}
            >
                {Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(1)} SOL
            </span>
        </button>
    );
}

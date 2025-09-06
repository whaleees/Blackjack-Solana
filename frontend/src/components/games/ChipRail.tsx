// src/components/games/ChipRail.tsx
"use client";
import { useRef } from "react";
import { Chip } from "@/components/games/Chips";

type ChipColor = "blue" | "red" | "green" | "black" | "purple" | "gold";
const CHIP_COLOR: Record<number, ChipColor> = {
    0.1: "gold", 0.5: "gold", 1: "blue", 5: "red", 10: "green", 25: "purple",
};
const DENOMS = [0.1, 0.5, 1, 5, 10, 25];

export default function ChipRail({
    disabled, onAdd, onSub, onClear,
}: {
    disabled?: boolean;
    onAdd: (d: number) => void;
    onSub: (d: number) => void;   // remove one of denom (nearest from top)
    onClear?: () => void;
}) {
    const lpTimer = useRef<number | null>(null);
    const longPressed = useRef(false);

    const clearLP = () => {
        if (lpTimer.current !== null) {
            window.clearTimeout(lpTimer.current);
            lpTimer.current = null;
        }
    };

    const handlePointerDown = (d: number) => {
        if (disabled) return;
        longPressed.current = false;

        // long-press => subtract
        lpTimer.current = window.setTimeout(() => {
            longPressed.current = true;
            onSub(d);
            clearLP();
        }, 450);

        const cancel = () => {
            clearLP();
            window.removeEventListener("pointerup", cancel);
            window.removeEventListener("pointercancel", cancel);
            window.removeEventListener("pointerleave", cancel);
        };
        window.addEventListener("pointerup", cancel);
        window.addEventListener("pointercancel", cancel);
        window.addEventListener("pointerleave", cancel);
    };

    const handleClick = (e: React.MouseEvent, d: number) => {
        if (disabled) return;

        // if long-press already triggered, ignore the click
        if (longPressed.current) {
            longPressed.current = false;
            return;
        }

        // otherwise, this is a normal click
        clearLP();

        // Alt/Ctrl/Meta/right-click => subtract, else add
        if (e.altKey || e.ctrlKey || e.metaKey || e.button === 2) {
            onSub(d);
        } else {
            onAdd(d);
        }
    };

    return (
        <div
            className={[
                "rounded-2xl border border-white/10 bg-black/30",
                "px-4 py-2 flex items-center gap-3",
                "shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]",
            ].join(" ")}
        >
            {DENOMS.map((d) => (
                <button
                    key={d}
                    disabled={disabled}
                    onPointerDown={() => handlePointerDown(d)}
                    onClick={(e) => handleClick(e, d)}
                    onContextMenu={(e) => { e.preventDefault(); if (!disabled) onSub(d); }}
                    className={[
                        "relative rounded-full transition-transform duration-200",
                        disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-110 active:scale-95",
                    ].join(" ")}
                    title={`${d} SOL • click=add, alt/right-click/long-press=sub`}
                >
                    <Chip denom={d} color={CHIP_COLOR[d]} size={50} />
                </button>
            ))}

            <button
                disabled={disabled}
                onClick={onClear}
                className="ml-2 text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear bet"
            >
                Clear
            </button>
        </div>
    );
}

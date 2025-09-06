"use client";
import React from "react";
import { Chip } from "@/components/games/Chips";

type Denom = { v: number; color: Parameters<typeof Chip>[0]["color"] };

const DENOMS: Denom[] = [
    { v: 100, color: "black" },
    { v: 25, color: "green" },
    { v: 10, color: "red" },
    { v: 5, color: "blue" },
    { v: 1, color: "purple" },
];

function breakdown(amount: number) {
    const chips: { v: number; color: Denom["color"]; count: number }[] = [];
    let rest = Math.max(0, Math.floor(amount));
    for (const d of DENOMS) {
        const n = Math.floor(rest / d.v);
        if (n > 0) {
            chips.push({ v: d.v, color: d.color, count: n });
            rest -= n * d.v;
        }
    }
    return chips;
}

export function BetChips({ amount }: { amount: number }) {
    const parts = breakdown(amount); // e.g. 137 -> 100x1, 25x1, 10x1, 1x2

    // Slight horizontal offsets to mimic stacks
    const offsets = [-10, -5, 0, 5, 10];

    return (
        <div className="flex items-end gap-3">
            {parts.map((p, col) => (
                <div key={col} className="relative h-14 w-[56px]">
                    {Array.from({ length: p.count }).slice(0, 5).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{
                                bottom: i * 9,
                                transform: `translateX(-50%) translateY(0)`,
                            }}
                        >
                            <Chip
                                denom={p.v}
                                color={p.color}
                                size={48}
                                className="will-change-transform"
                                title={`${p.v} chip`}
                            />
                        </div>
                    ))}
                    {/* subtle spread of stacks for multiple columns */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ transform: `translateX(${offsets[col % offsets.length]}px)` }}
                    />
                </div>
            ))}
        </div>
    );
}

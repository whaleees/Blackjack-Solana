"use client";
import React from "react";
import { Chip } from "./Chips";

export function BetChips({ amount }: { amount: number }) {
    // Decide chip denominations
    const chips = [];
    let remaining = amount;

    // Example: break amount into denominations
    const denoms = [100, 50, 25, 10, 5, 1];
    for (const d of denoms) {
        while (remaining >= d) {
            chips.push(d);
            remaining -= d;
        }
    }

    return (
        <div className="flex justify-center gap-1 mt-4">
            {chips.map((c, i) => (
                <Chip
                    key={i}
                    denom={c}
                    size={48}
                    color={c >= 100 ? "gold" : c >= 25 ? "blue" : "red"}
                />
            ))}
        </div>
    );
}

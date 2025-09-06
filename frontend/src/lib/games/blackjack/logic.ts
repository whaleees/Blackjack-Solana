import type { Outcome } from "./types";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function handTotal(cards: number[]) {
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

export function isBJ(cards: number[]) {
    return cards.length === 2 && handTotal(cards) === 21;
}

export function computeOutcomeLower(player: number[], dealer: number[]): Outcome {
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

export function computePayoutLamports(
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

    if (pBJ && !dBJ) return betLamports + (betLamports * 3n) / 2n; // 3:2
    if (dBJ && !pBJ) return 0n;

    if (pt > dt) return betLamports * 2n;
    if (pt < dt) return 0n;
    return betLamports; // push
}

export function fmtSolLamports(lamports: bigint) {
    const sol = Number(lamports) / LAMPORTS_PER_SOL;
    const sign = Math.sign(sol) >= 0 ? "+" : "−";
    return sign + Math.abs(sol).toLocaleString(undefined, { maximumFractionDigits: 9 });
}

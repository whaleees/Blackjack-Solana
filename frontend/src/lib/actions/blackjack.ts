"use client";

import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { AnchorProg } from "@/types/anchor_prog";

type Program = anchor.Program<AnchorProg>;
const { BN } = anchor;

/** Narrow-ish status label from Anchor enum objects like { playerTurn: {} } */
export type StatusLabel =
    | "awaitingRandomness"
    | "playerTurn"
    | "dealerTurn"
    | "settled"
    | "closed";

/** Minimal shape you actually read in the UI */
export type GameAccountShape = {
    table: web3.PublicKey;
    player: web3.PublicKey;
    betAmount: anchor.BN;
    status: unknown;
    usedMask: number;
    rng: number[];
    rngCursor: number;
    playerCards: number[];
    dealerCards: number[];
};

interface PlayerActAccount {
    player: web3.PublicKey;
    table: web3.PublicKey;
    game: web3.PublicKey;
}

interface RandomCardAccount {
    table: web3.PublicKey;
    game: web3.PublicKey;
    randomness: Uint8Array;
}

interface EndAccount {
    player: web3.PublicKey;
    table: web3.PublicKey;
    game: web3.PublicKey;
    vault: web3.PublicKey;
}

const toBN = (x: number | anchor.BN) => (BN.isBN(x as unknown) ? (x as anchor.BN) : new BN(x));

export async function tableCreate(program: Program, accounts: Record<string, web3.PublicKey>) {
    return await program.methods.tableCreate().accounts(accounts).rpc();
}

export async function newBet(
    program: Program,
    betAmount: number | anchor.BN,
    accounts: Record<string, web3.PublicKey>
) {
    const amt = toBN(betAmount);
    return await program.methods.newBet(amt).accounts(accounts).rpc();
}

export async function playerHit(program: Program, accounts: PlayerActAccount) {
    return await program.methods.hitPlayer().accounts(accounts).rpc();
}

export async function playerStand(program: Program, accounts: PlayerActAccount) {
    return await program.methods.standPlayer().accounts(accounts).rpc();
}

export async function randomCard(
    program: Program,
    randomness: number[] | Uint8Array,
    accounts: RandomCardAccount
) {
    const arr = Array.from(randomness);
    return await program.methods.randomCard(arr).accounts(accounts).rpc();
}

export async function end(program: Program, accounts: EndAccount) {
    return await program.methods.end().accounts(accounts).rpc();
}

export async function fetchGame(
    program: Program,
    gamePubkey: web3.PublicKey
): Promise<GameAccountShape> {
    const acc = await program.account.game.fetch(gamePubkey);

    return {
        table: acc.table as web3.PublicKey,
        player: acc.player as web3.PublicKey,
        betAmount: acc.betAmount as anchor.BN,
        status: acc.status as unknown,
        usedMask: Number(acc.usedMask),
        rng: Array.from(acc.rng as number[] | Uint8Array),
        rngCursor: Number(acc.rngCursor),
        playerCards: Array.from(acc.playerCards as number[] | Uint8Array),
        dealerCards: Array.from(acc.dealerCards as number[] | Uint8Array),
    };
}

export function anchorEnumToLabel(e: unknown): string {
    if (e && typeof e === "object") {
        const k = Object.keys(e as Record<string, unknown>)[0];
        return k ?? "unknown";
    }
    return String(e);
}


export function handTotal(cards: number[]): number {
    let total = 0;
    let aces = 0;
    for (const c of cards) {
        const r = (c % 13) + 1;
        if (r === 1) {
            total += 11;
            aces++;
        } else if (r >= 11) {
            total += 10;
        } else {
            total += r;
        }
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export function isBJ(cards: number[]): boolean {
    return cards.length === 2 && handTotal(cards) === 21;
}

export function computeOutcome(
    player: number[],
    dealer: number[]
): "playerwin" | "dealerwin" | "push" {
    const pt = handTotal(player);
    const dt = handTotal(dealer);
    const pBJ = isBJ(player);
    const dBJ = isBJ(dealer);

    if (pt > 21) return "dealerwin";
    if (dt > 21) return "playerwin";
    if (pBJ && !dBJ) return "playerwin";
    if (dBJ && !pBJ) return "dealerwin";
    if (pt > dt) return "playerwin";
    if (pt < dt) return "dealerwin";
    return "push";
}

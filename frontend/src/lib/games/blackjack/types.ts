export type Outcome = "playerwin" | "dealerwin" | "push";

export type StatusKey =
    | "unknown"
    | "playerturn"
    | "dealerturn"
    | "settled"
    | "closed"
    | Outcome;

export interface PayoutInfo {
    payoutLamports: bigint;
    netLamports: bigint;
    netFormatted: string;
}
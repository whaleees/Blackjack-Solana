"use client";
import CardHand from "@/components/games/CardHand";
import CasinoTable from "@/components/games/CasinoTable";
import BetCircle from "@/components/games/BetCircle";

type Props = {
    gamePubkey: string;
    playerText: string;
    dealerText: string;
    playerCards?: number[];
    dealerCards?: number[];
    betSol: number;
    statusLabel: string;
    rngCursor?: number | string;
    onReset: () => void;
    canHit: boolean;
    canStand: boolean;
    inDealerPhase: boolean;
    roundOver: boolean;
    onHit: () => void;
    onStand: () => void;
    lastSig?: string | null;
    explorer?: "solscan" | "solanafm" | "xray";
};

export default function GamePanel({
    gamePubkey,
    playerText,
    dealerText,
    playerCards,
    dealerCards,
    betSol,
    statusLabel,
    rngCursor,
    onReset,
    canHit,
    canStand,
    inDealerPhase,
    roundOver,
    onHit,
    onStand,
    lastSig,
    explorer = "solscan",
}: Props) {
    const link =
        lastSig &&
        (explorer === "solscan"
            ? `https://solscan.io/tx/${lastSig}?cluster=devnet`
            : explorer === "solanafm"
                ? `https://solana.fm/tx/${lastSig}?cluster=devnet-solana`
                : `https://xray.helius.xyz/tx/${lastSig}?cluster=devnet`);

    return (
        <CasinoTable
            className="min-h-[600px] md:min-h-[640px] lg:min-h-[720px]"
            header={
                <>
                    <div className="text-xs text-white/60 break-all">
                        Game: {gamePubkey || "—"}
                    </div>
                    <button
                        className="text-xs underline opacity-80"
                        onClick={onReset}
                        title="Reset current game"
                    >
                        Reset
                    </button>
                </>
            }
            topArea={
                dealerCards?.length ? (
                    <CardHand
                        cards={dealerCards}
                        revealAll={inDealerPhase || roundOver}
                        startDelayMs={80}
                    />
                ) : (
                    <div className="opacity-70">{dealerText || "—"}</div>
                )
            }
            bottomArea={
                <div className="flex flex-col gap-4">
                    {playerCards?.length ? (
                        <CardHand cards={playerCards} revealAll startDelayMs={60} />
                    ) : (
                        <div className="opacity-70">{playerText || "—"}</div>
                    )}

                    <div className="flex gap-3">
                        <button
                            className="px-5 py-2 rounded-xl bg-white/10 text-white disabled:opacity-40"
                            disabled={!canHit || inDealerPhase || roundOver}
                            onClick={onHit}
                            title={inDealerPhase ? "Wait for dealer to finish" : "Hit"}
                        >
                            Hit
                        </button>
                        <button
                            className="px-5 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40"
                            disabled={!canStand || inDealerPhase || roundOver}
                            onClick={onStand}
                            title={inDealerPhase ? "Wait for dealer to finish" : "Stand"}
                        >
                            Stand
                        </button>
                    </div>
                </div>
            }
            // inside GamePanel JSX
            centerArea={
                <BetCircle
                    stack={betSol > 0 ? [betSol] : []}   // minimal stack for display
                    amount={betSol}
                // no onPop => center chip won’t be clickable
                />
            }

            footer={
                <>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
                        <span>Bet: {betSol} SOL</span>
                        <span>Status: {statusLabel}</span>
                        <span>RNG cursor: {rngCursor ?? "—"}</span>
                    </div>

                    {lastSig && (
                        <div className="text-xs text-gray-500 break-all mt-2">
                            Last tx:{" "}
                            {link ? (
                                <a className="underline" href={link} target="_blank" rel="noreferrer">
                                    {lastSig}
                                </a>
                            ) : (
                                lastSig
                            )}
                        </div>
                    )}
                </>
            }
        />
    );
}

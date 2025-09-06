"use client";
import PlayingCard from "./PlayingCard";

function numToRankSuit(n: number) {
    const rankIdx = (n % 13) + 1; // 1..13
    const suitIdx = Math.floor(n / 13); // 0..3
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
    const suits: Array<"♣" | "♦" | "♥" | "♠"> = ["♣", "♦", "♥", "♠"];
    return { rank: ranks[rankIdx - 1], suit: suits[suitIdx] };
}

type Props = {
    cards: number[];
    revealAll?: boolean;       // for dealer hand: false while player's turn
    startDelayMs?: number;     // base delay for first card
    staggerMs?: number;        // increment per card
};

export default function CardHand({
    cards, revealAll = true, startDelayMs = 0, staggerMs = 120
}: Props) {
    return (
        <div className="flex items-center gap-2">
            {cards.length === 0 && <span>—</span>}
            {cards.map((c, i) => {
                const { rank, suit } = numToRankSuit(c);
                const revealed = revealAll || i === 0; // mask all but first when not revealed
                return (
                    <PlayingCard
                        key={`${c}-${i}`}
                        rank={rank}
                        suit={suit}
                        revealed={revealed}
                        delayMs={startDelayMs + i * staggerMs}
                    />
                );
            })}
        </div>
    );
}

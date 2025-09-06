"use client";

type Suit = "♠" | "♥" | "♦" | "♣";

export type PlayingCardProps = {
    rank: string;         // "A","2"..,"K"
    suit: Suit;
    revealed?: boolean;   // show front or back
    delayMs?: number;     // deal-in delay
};

export default function PlayingCard({
    rank, suit, revealed = true, delayMs = 0
}: PlayingCardProps) {
    const isRed = suit === "♥" || suit === "♦";

    return (
        <div
            className={`card ${revealed ? "revealed" : ""} deal-in`}
            style={{ animationDelay: `${delayMs}ms` }}
        >
            <div className="card-inner">
                {/* front */}
                <div className="card-face card-front">
                    <div className={`card-rank ${isRed ? "text-rose-600" : "text-black"}`}>
                        {rank}
                    </div>
                    <div className={`card-center ${isRed ? "text-rose-600" : "text-black"}`}>
                        {suit}
                    </div>
                    <div className={`card-suit ${isRed ? "text-rose-600" : "text-black"} justify-self-end`}>
                        {suit}
                    </div>
                </div>
                {/* back */}
                <div className="card-face card-back">
                    <div className="card-center">🂠</div>
                </div>
            </div>
        </div>
    );
}

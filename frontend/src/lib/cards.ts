const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♣", "♦", "♥", "♠"]; // change order if your program uses a different suit order

export function decodeCard(n: number) {
    const rank = n % 13;
    const suit = Math.floor(n / 13);
    return `${RANKS[rank]}${SUITS[suit]}`;
}

export function cardsToText(arr: number[] = []) {
    return arr.map(decodeCard).join(" ");
}
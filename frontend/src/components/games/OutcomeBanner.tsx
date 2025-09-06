"use client";
type Props = { outcome: "playerwin" | "dealerwin" | "push"; netFormatted: string };

export default function OutcomeBanner({ outcome, netFormatted }: Props) {
    const msg =
        outcome === "playerwin" ? "🎉 Player wins!" :
            outcome === "dealerwin" ? "💀 Dealer wins!" : "🤝 Push!";
    const cls =
        outcome === "playerwin" ? "text-emerald-400" :
            outcome === "dealerwin" ? "text-rose-400" : "opacity-70";

    return (
        <div className="mt-3 rounded-lg border px-4 py-3 bg-white/5 font-semibold flex items-center gap-3">
            <span>{msg}</span>
            <span className={cls}>{netFormatted} SOL</span>
        </div>
    );
}

"use client";
type Props = { statusKey: string; label: string };
export default function StatusPill({ statusKey, label }: Props) {
    const styles =
        statusKey === "playerturn"
            ? "border-emerald-500 text-emerald-400"
            : statusKey === "dealerturn" || statusKey === "settled"
                ? "border-amber-500 text-amber-400"
                : statusKey === "playerwin"
                    ? "border-emerald-500 text-emerald-400"
                    : statusKey === "dealerwin"
                        ? "border-rose-500 text-rose-400"
                        : "border-zinc-500 text-zinc-400";

    return (
        <span className={`text-xs rounded-full px-2 py-1 border ${styles}`} title="Game status">
            {label}
        </span>
    );
}

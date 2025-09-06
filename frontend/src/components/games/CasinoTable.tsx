"use client";
import { ReactNode } from "react";

type Props = {
    /** content above the felt (game id + reset, etc) */
    header?: ReactNode;
    /** dealer lane (top/left on wide) */
    topArea: ReactNode;
    /** player lane (bottom/right on wide) */
    bottomArea: ReactNode;
    /** center of the felt (chips / bet circle) */
    centerArea?: ReactNode;
    /** content below the felt (chip rail, last tx, outcome banner) */
    footer?: ReactNode;
    /** extra classes for outer container */
    className?: string;
};

/**
 * Full-bleed casino table:
 * - felt background + vignette
 * - big center oval
 * - two lanes (stack on mobile, side-by-side on md+)
 * - center chip area
 * - optional header/footer regions
 */
export default function CasinoTable({
    header,
    topArea,
    bottomArea,
    centerArea,
    footer,
    className,
}: Props) {
    return (
        <section
            className={[
                // full-bleed horizontally
                "relative mx-[calc(50%-50vw)] w-screen",
                // tall enough to feel like a table
                "min-h-[72vh] md:min-h-[78vh] lg:min-h-[85vh]",
                "overflow-hidden",
                className || "",
            ].join(" ")}
        >
            {/* Felt & vignette */}
            <div className="absolute inset-0 bg-[#0b0b0d] bg-[radial-gradient(1200px_700px_at_70%_-10%,rgba(99,102,241,.12),transparent)]" />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06),transparent_60%)]" />
            </div>

            {/* Header (over the felt) */}
            {header && (
                <div className="relative z-20">
                    <div className="max-w-6xl mx-auto px-6 pt-4 flex items-center justify-between">
                        {header}
                    </div>
                </div>
            )}

            {/* Center oval edge */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="border border-white/15 rounded-[999px] w-[min(1100px,90vw)] h-[min(52vh,520px)]" />
            </div>

            {/* Lanes */}
            <div className="relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 px-6 md:px-8 pt-10 md:pt-12 lg:pt-16 pb-28 md:pb-45">
                    {/* Dealer lane */}
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5">
                        <div className="text-sm font-semibold mb-2 opacity-80">Dealer</div>
                        {topArea}
                    </div>

                    {/* Player lane */}
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5">
                        <div className="text-sm font-semibold mb-2 opacity-80">Player</div>
                        {bottomArea}
                    </div>
                </div>
            </div>

            {centerArea && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {/* decorative ring, still non-interactive */}
                    <div className="w-[92px] h-[92px] rounded-full bg-[rgba(30,64,175,.22)]
                    backdrop-blur-[2px] border border-indigo-300/40
                    shadow-[0_0_0_10px_rgba(99,102,241,.08)]" />
                    {/* the *only* interactive part */}
                    <div className="absolute pointer-events-auto">{centerArea}</div>
                </div>
            )}



            {/* Footer (chip rail, tx, outcome etc.) */}
            {footer && (
                <div className="relative z-20">
                    <div className="max-w-6xl mx-auto px-6 pb-8 flex flex-col items-center">
                        {footer}
                    </div>
                </div>
            )}
        </section>
    );
}

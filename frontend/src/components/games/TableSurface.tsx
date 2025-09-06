"use client";
import { ReactNode } from "react";

/**
 * A full-width felt table with a centered oval, soft vignette,
 * and 2 “lanes” for dealer (left) + player (right).
 *
 * Children are injected into three named slots via props.
 */
export default function TableSurface({
    dealerArea,
    playerArea,
    centerArea,
}: {
    dealerArea: ReactNode;
    playerArea: ReactNode;
    centerArea?: ReactNode;
}) {
    return (
        <div className="relative w-full">
            {/* Felt background */}
            <div
                className="
          relative w-full overflow-hidden
          rounded-3xl border border-white/10
          bg-gradient-to-b from-[#0f0f13] to-[#0a0a0d]
        "
                style={{
                    boxShadow:
                        "0 30px 60px rgba(0,0,0,.45), inset 0 0 120px rgba(162,108,255,.06)",
                }}
            >
                {/* subtle vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-20%,rgba(119,84,255,.10),transparent_60%)]" />

                {/* oval line (table edge) */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[240px] w-[78%] rounded-full border border-white/10/50" />
                </div>

                {/* content grid */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
                    <div className="min-h-[220px]">{dealerArea}</div>
                    <div className="min-h-[220px]">{playerArea}</div>
                </div>

                {/* center area (bet circle / chips) */}
                {centerArea && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="pointer-events-auto">{centerArea}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

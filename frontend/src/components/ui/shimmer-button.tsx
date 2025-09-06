"use client";

import Link from "next/link";

type Props = { href: string; children: React.ReactNode };

export default function ShimmerButton({ href, children }: Props) {
    return (
        <Link
            href={href}
            className="relative inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-900/30 transition-transform active:scale-[0.98]"
        >
            {/* shimmer line */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <span className="absolute -inset-y-1 -left-1 w-[120%] -skew-x-[20deg] bg-white/10 [animation:shimmer_2.4s_linear_infinite]" />
            </span>
            {children}
        </Link>
    );
}

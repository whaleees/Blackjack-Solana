"use client";
import React from "react";
import clsx from "clsx";

type ChipColor = "blue" | "red" | "green" | "black" | "purple" | "gold";

const palette: Record<ChipColor, { base: string; edge: string; text: string }> = {
    blue: { base: "#1b56c5", edge: "#82b1ff", text: "#ffffff" },
    red: { base: "#c21d34", edge: "#ff9aa6", text: "#ffffff" },
    green: { base: "#138a57", edge: "#96e5c1", text: "#ffffff" },
    black: { base: "#15181f", edge: "#9aa0af", text: "#ffffff" },
    purple: { base: "#6b39d4", edge: "#d1b8ff", text: "#ffffff" },
    gold: { base: "#caa33b", edge: "#ffe399", text: "#1d1d1f" },
};

export function Chip({
    denom,
    color = "blue",
    size = 48,
    className,
    title,
}: {
    denom: number | string;
    color?: ChipColor;
    size?: number;           // px
    className?: string;
    title?: string;
}) {
    const p = palette[color];
    const r = size / 2;
    const edgeStripeCount = 8;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={clsx("select-none drop-shadow", className)}
            aria-label={String(denom)}
        >
            <title>{title ?? `${denom} chip`}</title>

            {/* outer ring */}
            <circle cx={r} cy={r} r={r - 1} fill={p.base} stroke="#fff" strokeWidth="2" />

            {/* edge stripes */}
            <g transform={`translate(${r} ${r})`}>
                {Array.from({ length: edgeStripeCount }).map((_, i) => {
                    const a = (i / edgeStripeCount) * Math.PI * 2;
                    const w = size * 0.10;
                    const h = size * 0.16;
                    const x = (r - w / 2) * Math.cos(a);
                    const y = (r - w / 2) * Math.sin(a);
                    return (
                        <rect
                            key={i}
                            x={-w / 2 + x}
                            y={-h / 2 + y}
                            width={w}
                            height={h}
                            rx={w * 0.2}
                            fill={p.edge}
                            transform={`rotate(${(a * 180) / Math.PI})`}
                            opacity={0.92}
                        />
                    );
                })}
            </g>

            {/* inner ring */}
            <circle cx={r} cy={r} r={r * 0.63} fill="rgba(255,255,255,.12)" />
            <circle cx={r} cy={r} r={r * 0.52} fill="rgba(0,0,0,.18)" />

            {/* glossy highlight */}
            <ellipse
                cx={r * 0.7}
                cy={r * 0.65}
                rx={r * 0.45}
                ry={r * 0.22}
                fill="rgba(255,255,255,.18)"
                filter="blur(2px)"
            />

            {/* denomination */}
            <text
                x="50%"
                y="52%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight={800}
                fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                fontSize={size * 0.34}
                fill={p.text}
                style={{ paintOrder: "stroke" }}
                stroke="rgba(0,0,0,.45)"
                strokeWidth={size * 0.04}
            >
                {denom}
            </text>
        </svg>
    );
}

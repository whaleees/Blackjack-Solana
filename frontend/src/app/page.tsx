// src/app/page.tsx
"use client";

import Link from "next/link";
import { Sparkles, Play, Coins, ShieldCheck, ArrowRight, Repeat } from "lucide-react";

function GlowPill({
  children,
  href,
  icon: Icon = Play,
}: {
  children: React.ReactNode;
  href: string;
  icon?: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="
        group relative inline-flex items-center gap-2 rounded-2xl px-5 py-3
        bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold
        shadow-[0_8px_30px_-8px_rgba(99,102,241,.6)]
        hover:shadow-[0_12px_40px_-10px_rgba(236,72,153,.55)]
        transition-all active:scale-[.98]
      "
    >
      <span className="absolute -inset-[2px] rounded-2xl bg-[conic-gradient(at_30%_120%,#6366f1,transparent_25%,#d946ef_55%,transparent_75%)] opacity-20 blur-md" />
      <Icon className="h-4 w-4" />
      <span className="relative">{children}</span>
    </Link>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur-md",
        "shadow-[0_20px_60px_-20px_rgba(0,0,0,.55)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden">
      {/* Deep casino gradient + vignette */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(99,102,241,.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_20%,rgba(217,70,239,.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_60%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* HERO */}
        <section className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300/80" />
            Professional Crypto Gambler <span className="opacity-60">(DEVNET only)</span>
          </div>

          <h1
            className="
              mt-4 text-4xl md:text-6xl font-extrabold tracking-tight text-white
              drop-shadow-[0_8px_30px_rgba(0,0,0,.45)]
            "
          >
            Blackjack Bet App
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Fast, fair, and on-chain. Place your chips, hit or stand, and let the VRF decide your fate.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <GlowPill href="/games" icon={Play}>Start Gambling</GlowPill>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
            >
              Demo (devnet) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* badges */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/60 border border-white/10">Devnet</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/60 border border-white/10">On-chain RNG (dev mocked)</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/60 border border-white/10">No real funds</span>
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard>
            <div className="p-5">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300">
                <Coins className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">How to play</h3>
              <ul className="mt-2 list-decimal pl-5 text-sm text-white/70 space-y-1.5">
                <li>Place your bet with chips.</li>
                <li>Hit to draw; Stand to lock.</li>
                <li>Dealer draws to 17 (hits on soft 17).</li>
                <li>Best hand ≤ 21 wins.</li>
              </ul>
              <p className="mt-3 text-xs text-white/50">Tip: Aces auto swap 11 → 1 to avoid busts.</p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-300">
                <Repeat className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Rules & payouts</h3>
              <ul className="mt-2 text-sm text-white/70 space-y-1.5">
                <li>Blackjack (A + 10/J/Q/K) pays <span className="font-semibold text-white">3:2</span>.</li>
                <li>Standard win pays <span className="font-semibold text-white">1:1</span>; push returns stake.</li>
                <li>Cards auto resolve in dealer phase.</li>
              </ul>
              <Link href="/games" className="mt-3 inline-block text-xs text-indigo-300 hover:underline">
                See examples →
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Fairness & on-chain</h3>
              <p className="mt-2 text-sm text-white/70">
                Dev RNG fulfills from bytes (fast). For production, plug in a VRF oracle for verifiable randomness.
                Bets & payouts are handled by PDAs on Solana.
              </p>
              <p className="mt-3 text-xs text-white/50">
                Note: balances & fees are demo-only; no real funds.
              </p>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}

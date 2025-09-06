"use client";
import { AppHero } from "@/components/app-hero";
import ShimmerButton from "@/components/ui/shimmer-button";

export function DashboardFeature() {
  return (
    <div>
      <AppHero
        title="Blackjack Bet App"
        subtitle="Professional Crypto Gambler (DEVNET only)"
      />

      {/* CTA */}
      <div className="mx-auto mt-8 max-w-3xl px-6">
        <div className="flex items-center justify-center">
          <ShimmerButton href="/games">
            <span>🎰 Start Gambling</span>
            <span>🎲</span>
          </ShimmerButton>
        </div>

        {/* Quick badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Devnet Demo</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">On-chain RNG (dev mocked)</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">No real funds</span>
        </div>
      </div>

      {/* Content sections */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-12 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-xl font-semibold">How to play</h2>
          <ol className="text-sm/6 text-gray-300 space-y-2">
            <li>1. Place your bet and receive 2 cards.</li>
            <li>2. <b>Hit</b> to draw a card, or <b>Stand</b> to lock your hand.</li>
            <li>3. Dealer draws to 17 and hits on soft 17.</li>
            <li>4. Closest to 21 without busting wins.</li>
          </ol>
          <p className="mt-4 text-xs text-gray-400">
            Tip: Aces count as 11, but switch to 1 automatically if you’d bust.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-xl font-semibold">Rules & payouts</h2>
          <ul className="text-sm/6 text-gray-300 space-y-2">
            <li>• Blackjack (A + 10/J/Q/K) pays <b>3:2</b>.</li>
            <li>• Standard win pays <b>1:1</b>; push returns your bet.</li>
            <li>• Dealer hits on soft 17.</li>
          </ul>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-300">See examples</summary>
            <div className="mt-3 text-sm text-gray-300 space-y-2">
              <p>• You 20 vs Dealer 19 → you win 1× bet.</p>
              <p>• You 21 on first two cards → 3:2 payout.</p>
              <p>• Both 18 → push (bet refunded).</p>
            </div>
          </details>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-xl font-semibold">Fairness & on-chain</h2>
          <p className="text-sm/6 text-gray-300">
            Dev RNG fulfills from bytes for local testing. In production, use a VRF oracle for verifiable randomness.
            Bets & payouts are handled by PDAs on Solana devnet.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Note: gas/fees are test-lamports; balances are not real funds.
          </p>
        </section>
      </div>
    </div>
  );
}

import { AppHero } from "@/components/app-hero";
import Link from "next/link";

export function DashboardFeature() {
  return (
    <div>
      {/* HERO */}
      <AppHero
        title="Blackjack Bet App"
        subtitle="Professional Crypto Gambler (DEVNET only)"
      />

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-center mt-6">
          <Link
            href="/games"
            className="
              inline-flex items-center gap-2
              px-8 py-4 rounded-2xl text-lg font-semibold
              text-white bg-gradient-to-r from-purple-600 to-indigo-600
              shadow-lg shadow-indigo-900/30
              hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-900/40
              active:scale-[0.98] transition-all
              border border-white/10
            "
          >
            <span>🎰 Start Gambling</span>
            <span>🎲</span>
          </Link>
        </div>

        {/* Quick badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            Devnet Demo
          </span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            On-chain RNG (dev mocked)
          </span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            No real funds
          </span>
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* How to Play */}
        <section className="col-span-1 lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-3">How to play</h2>
          <ol className="space-y-2 text-sm/6 text-gray-300">
            <li>1. Place your bet and receive 2 cards.</li>
            <li>2. <b>Hit</b> to draw a card, or <b>Stand</b> to lock your hand.</li>
            <li>3. Dealer draws to 17 and hits on soft 17.</li>
            <li>4. Closest to 21 without busting wins.</li>
          </ol>
          <div className="mt-4 text-xs text-gray-400">
            Tip: Aces count as 11, but switch to 1 automatically if you’d bust.
          </div>
        </section>

        {/* Rules & Payouts */}
        <section className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-3">Rules & payouts</h2>
          <ul className="text-sm/6 text-gray-300 space-y-2">
            <li>• Blackjack (A + 10/J/Q/K) pays <b>3:2</b>.</li>
            <li>• Standard win pays <b>1:1</b>.</li>
            <li>• Push returns your bet.</li>
            <li>• Dealer hits on soft 17.</li>
          </ul>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm text-gray-300 hover:text-white">
              See examples
            </summary>
            <div className="mt-3 text-sm text-gray-300 space-y-2">
              <p>• You 20 vs Dealer 19 → you win 1× bet.</p>
              <p>• You 21 on first two cards → 3:2 payout.</p>
              <p>• Both 18 → push (bet refunded).</p>
            </div>
          </details>
        </section>

        {/* Fairness / On-chain */}
        <section className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-3">Fairness & on-chain</h2>
          <p className="text-sm/6 text-gray-300">
            This demo uses a dev RNG fulfill call to deal cards deterministically from a
            byte array (for local testing). In production, plug in a VRF oracle so
            randomness is verifiable and trust-minimized. All bets and payouts are
            handled by program PDAs on Solana devnet.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Note: gas/fees are test-lamports; balances are not real funds.
          </div>
        </section>
      </div>
    </div>
  );
}

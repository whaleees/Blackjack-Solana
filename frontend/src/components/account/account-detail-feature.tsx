"use client";

import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountTransactions,
} from "./account-ui";
import { ellipsify } from "@/lib/utils";

export default function AccountDetailFeature() {
  const params = useParams();

  const address = useMemo(() => {
    const raw = Array.isArray(params.address) ? params.address[0] : params.address;
    if (!raw) return undefined;
    try {
      return new PublicKey(raw);
    } catch {
      return undefined;
    }
  }, [params.address]);

  if (!address) {
    return (
      <section className="mx-auto max-w-3xl py-10">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          <h2 className="text-lg font-semibold">Invalid account address</h2>
          <p className="mt-1 text-sm text-red-100/80">
            The URL does not contain a valid Solana public key.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* HERO CARD */}
      <section className="relative mx-auto mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/60 p-6 sm:p-8 backdrop-blur-xl">
        {/* gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 400px at 30% -10%, rgba(168,85,247,0.25), transparent 50%), radial-gradient(1000px 500px at 80% -20%, rgba(79,70,229,0.25), transparent 55%)",
          }}
        />
        {/* hairline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-500/40 via-indigo-400/40 to-emerald-400/40" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* LEFT: balance + address */}
          <div>
            <div className="text-xs uppercase tracking-wide text-white/60">Balance</div>
            {/* Big balance from your data hook */}
            <div className="mt-2 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              <AccountBalance address={address} />
            </div>

            <div className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80">
                <ExplorerLink
                  path={`account/${address}`}
                  label={ellipsify(address.toString())}
                />
              </span>
            </div>
          </div>

          {/* RIGHT: action buttons (unchanged component, just placed here) */}
          <div className="flex flex-wrap items-center gap-2">
            <AccountButtons address={address} />
          </div>
        </div>
      </section>

      {/* TOKEN ACCOUNTS */}
      <section className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/60 p-5 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Token Accounts</h3>
          {/* Keep room for your refresh button inside AccountTokens if it exists */}
        </div>
        <AccountTokens address={address} />
      </section>

      {/* TRANSACTIONS */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/60 p-5 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Transaction History</h3>
          <a
            className="text-xs text-white/70 underline-offset-4 hover:text-white hover:underline"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Show all
          </a>
        </div>
        <AccountTransactions address={address} />
      </section>
    </div>
  );
}

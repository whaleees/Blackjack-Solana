"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountListFeature() {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (publicKey) router.replace(`/account/${publicKey.toString()}`);
  }, [publicKey, router]);

  return (
    <section className="relative mx-auto max-w-5xl py-16">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/60 p-10 text-center backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 400px at 50% -10%, rgba(168,85,247,0.22), transparent 55%)",
          }}
        />
        <h1 className="mb-3 text-2xl font-bold text-white">Connect your wallet</h1>
        <p className="mb-6 text-white/70">
          View balance, token accounts, and recent transactions.
        </p>
        <div className="inline-flex">
          <WalletButton />
        </div>
      </div>
    </section>
  );
}

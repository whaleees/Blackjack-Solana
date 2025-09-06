"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeSelect } from "@/components/theme-select";
import { ClusterUiSelect } from "./cluster/cluster-ui";
import { WalletButton } from "@/components/solana/solana-provider";

export function AppHeader({
  links = [],
}: {
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50">
      {/* neon hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-500/40 via-indigo-400/40 to-emerald-400/40" />

      <div className="relative border-b border-white/10 bg-[#0b0b0d]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0b0b0d]/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
              <span className="absolute inset-0 rounded-md bg-gradient-to-br from-fuchsia-600/30 to-indigo-500/20 blur-sm" />
              <span className="relative text-sm font-bold">W</span>
            </span>
            Solana Blackjack
          </Link>

          {/* Nav */}
          <nav className="ml-6 hidden gap-1 md:flex">
            {links.map(({ label, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  className={`relative rounded-lg px-4 py-2 text-base transition hover:text-white ${active ? "text-white" : "text-white/70"
                    }`}
                >
                  {active && (
                    <span className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-fuchsia-500/20 via-indigo-500/15 to-emerald-500/20 ring-1 ring-white/10" />
                  )}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Actions (wallet/theme/etc.) */}
          <div className="hidden items-center gap-3 md:flex">
            <WalletButton />
            <ClusterUiSelect />
            <ThemeSelect />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setShowMenu((s) => !s)}
            aria-label="Toggle menu"
          >
            {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </header>

  );
}

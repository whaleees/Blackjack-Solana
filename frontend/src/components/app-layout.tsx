"use client";

import { Toaster } from "./ui/sonner";
import { AppHeader } from "@/components/app-header";
import React from "react";
import { AppFooter } from "@/components/app-footer";
import { ClusterChecker } from "@/components/cluster/cluster-ui";
import { AccountChecker } from "@/components/account/account-ui";

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode;
  links: { label: string; path: string }[];
}) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <AppHeader links={links} />
        <main className="container mx-auto flex-grow p-4">
          <ClusterChecker>
            <AccountChecker />
          </ClusterChecker>
          {children}
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </>
  );
}

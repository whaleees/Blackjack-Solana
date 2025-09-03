"use client";

import { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, IDL } from "@/lib/constants";

export function useProgram<T extends Idl = typeof IDL>() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const [program, setProgram] = useState<anchor.Program<T> | null>(null);
    const [provider, setProvider] = useState<anchor.AnchorProvider | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            setProgram(null);
            setProvider(null);

            if (!wallet) {
                setLoading(false);
                return;
            }

            try {
                const prov = new anchor.AnchorProvider(connection, wallet, {
                    commitment: "confirmed",
                    preflightCommitment: "confirmed",
                });
                anchor.setProvider(prov);

                const prog = new anchor.Program<T>(IDL as T, prov);

                if (!cancelled) {
                    setProvider(prov);
                    setProgram(prog);
                    setError(null);
                }
            } catch (err: unknown) {
                console.error("Failed to init program:", err);
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : String(err);
                    setError(msg);
                    setProgram(null);
                    setProvider(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [connection, wallet]);

    return { program, provider, programId: PROGRAM_ID, loading, error };
}

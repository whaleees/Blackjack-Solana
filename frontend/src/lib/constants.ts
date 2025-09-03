import { PublicKey } from "@solana/web3.js";
import idl from "@/idl/anchor_prog.json";
import type { Idl } from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey("9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7");
export const IDL = idl as Idl;
export const DEFAULT_RPC = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8899";
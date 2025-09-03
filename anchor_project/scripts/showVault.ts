import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7");
const TABLE_PDA = new PublicKey("4i7oLHWc4dBNHXhfGDus1vYt6cpoNiAQiRikd1wc7dkv");

// Case 1: vault = PDA([b"vault"], program_id)
const [vault1] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    PROGRAM_ID
);

// Case 2: vault = PDA([b"vault", table_pda], program_id)
const [vault2] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), TABLE_PDA.toBuffer()],
    PROGRAM_ID
);

console.log("Possible vault (seed only):", vault1.toBase58());
console.log("Possible vault (seed + table):", vault2.toBase58());

// Run
// npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/showVault.ts

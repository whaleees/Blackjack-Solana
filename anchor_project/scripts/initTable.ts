// scripts/initTable.ts
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const RPC_URL = "https://api.devnet.solana.com";
const IDL_PATH = path.join(__dirname, "../target/idl/anchor_prog.json");
const PROGRAM_ID = new PublicKey("9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7");

function loadLocalKeypair(): Keypair {
    const kpPath = path.join(os.homedir(), ".config", "solana", "id.json");
    const secret = JSON.parse(fs.readFileSync(kpPath, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
}
function keypairToWallet(kp: Keypair): anchor.Wallet {
    return {
        publicKey: kp.publicKey,
        signTransaction: async (tx: Transaction) => { tx.partialSign(kp); return tx; },
        signAllTransactions: async (txs: Transaction[]) => { txs.forEach(t => t.partialSign(kp)); return txs; },
    } as unknown as anchor.Wallet;
}

async function main() {
    const connection = new Connection(RPC_URL, "confirmed");
    const payer = loadLocalKeypair();
    const wallet = keypairToWallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const IDL = JSON.parse(fs.readFileSync(IDL_PATH, "utf8")) as anchor.Idl;
    const program = new anchor.Program(IDL, provider);

    // 👇 MUST match your IDL (table_state / vault)
    const [tablePda] = PublicKey.findProgramAddressSync([Buffer.from("table_state2")], program.programId);
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault2")], program.programId);

    console.log("💡 Using wallet:", payer.publicKey.toBase58());
    console.log("💡 Program ID   :", program.programId.toBase58());
    console.log("💡 Table PDA    :", tablePda.toBase58());
    console.log("💡 Vault PDA    :", vaultPda.toBase58());

    const sig = await program.methods
        .tableCreate()
        .accounts({
            authority: payer.publicKey,
            table: tablePda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    console.log("✅ Table created on devnet!");
    console.log("🧾 Tx:", sig);
}

main().catch(e => { console.error("❌ initTable failed:", e); process.exit(1); });

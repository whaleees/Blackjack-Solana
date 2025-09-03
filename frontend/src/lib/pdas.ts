import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@/lib/constants";

export function tablePda() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("table_state2")],
        PROGRAM_ID
    );
}

export function vaultPda() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("vault2")],
        PROGRAM_ID
    );
}
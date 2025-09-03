// random.ts
import * as nodeCrypto from "crypto";

// Guaranteed non-zero randomness for dev
export function randomBytes(len: number): number[] {
    const arr = new Uint8Array(len);

    // Browser crypto (Web Crypto API)
    if (
        typeof globalThis.crypto !== "undefined" &&
        typeof globalThis.crypto.getRandomValues === "function"
    ) {
        globalThis.crypto.getRandomValues(arr);
    }
    // Node crypto
    else if (typeof nodeCrypto.randomBytes === "function") {
        const buf = nodeCrypto.randomBytes(len);
        buf.forEach((b, i) => (arr[i] = b));
    }
    // Pure fallback
    else {
        for (let i = 0; i < len; i++) {
            arr[i] = (i * 37 + 17) & 0xff;
        }
    }

    // 🔑 Ensure not all zeros
    if (arr.every((x) => x === 0)) {
        for (let i = 0; i < len; i++) {
            arr[i] = (i * 37 + 17) & 0xff;
        }
    }

    return Array.from(arr);
}

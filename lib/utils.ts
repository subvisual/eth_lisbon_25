import { Hex } from "viem";

export function ensureHexString(hexString: string | undefined): `0x${string}` {
    if (!hexString) {
        throw new Error("Hex string is undefined or null");
    }

    const prefixedHex = hexString.startsWith("0x") ? hexString : `0x${hexString}`;
    return prefixedHex as `0x${string}`;
}

export function generateRandomBytes32(): `0x${string}` {
    return ("0x" +
        crypto
            .getRandomValues(new Uint8Array(32))
            .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "")) as Hex;
}
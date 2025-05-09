/**
 * Shutter helper utilities
 *
 * – Uses Chiado endpoint by default because the main‑net signer
 *   sometimes runs out of gas.  Flip the env‑var to "mainnet"
 *   when the prod API is stable again.
 */

import type { Hex } from 'viem';

const BASE =
  process.env.NEXT_PUBLIC_SHUTTER_ENV === 'mainnet'
    ? 'https://shutter-api.shutter.network/api'
    : 'https://shutter-api.chiado.staging.shutter.network/api';

export interface RegisteredIdentity {
  eon: number;
  eon_key: Hex;
  identity: Hex;
  identity_prefix: Hex;
  tx_hash: Hex;
}

/**
 * Register a new identity that will be decrypted 5 minutes in the future.
 * Throws if the API fails; caller may choose to fall back to an on‑chain
 * self‑registration.
 */
export async function registerIdentity(): Promise<RegisteredIdentity> {
  const identityPrefix =
    '0x' +
    Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const decryptionTimestamp = Math.floor(Date.now() / 1000) + 300; // +5 min

  const res = await fetch(`${BASE}/register_identity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decryptionTimestamp, identityPrefix }),
  });

  if (!res.ok) {
    throw new Error(
      `Shutter register_identity failed ${res.status}: ${await res.text()}`,
    );
  }

  return res.json();
}

export const SHUTTER_API_BASE = BASE;

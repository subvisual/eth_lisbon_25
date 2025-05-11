import { apiKit } from "./apiKit";
import { sepoliaNetwork, baseNetwork } from "./evmNetworks";

interface ShutterApiMessageData {
  eon: number;
  identity: string;
  identity_prefix: string;
  eon_key: string;
  tx_hash: string;
}

interface ShutterApiResponse {
  message: ShutterApiMessageData;
  error?: string;
}

interface ShutterDecryptionKeyData {
  decryption_key: string;
  identity: string;
  decryption_timestamp: number;
}

interface ShutterDecryptionKeyResponse {
  message: ShutterDecryptionKeyData;
  error?: string;
}

export const DECRYPTION_DELAY = 30;

export async function fetchShutterData(
  decryptionTimestamp: number
): Promise<ShutterApiMessageData> {
  try {
    console.log(
      `Sending request to Shutter API with decryption timestamp: ${decryptionTimestamp}`
    );

    const response = await fetch(
      "https://shutter-api.shutter.network/api/register_identity",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decryptionTimestamp,
        }),
      }
    );

    console.log(`API response status: ${response.status}`);

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${responseText}`
      );
    }

    let jsonResponse: ShutterApiResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse API response as JSON: ${responseText}`);
    }

    if (!jsonResponse.message) {
      throw new Error(
        `API response missing message data: ${JSON.stringify(jsonResponse)}`
      );
    }

    return jsonResponse.message;
  } catch (error) {
    console.error("Error fetching data from Shutter API:", error);
    throw error;
  }
}

export async function fetchDecryptionKey(
  identity: string
): Promise<ShutterDecryptionKeyData> {
  console.log(`Fetching decryption key for identity: ${identity}`);

  const response = await fetch(
    `https://shutter-api.shutter.network/api/get_decryption_key?identity=${identity}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    }
  );

  // Get the response text
  const responseText = await response.text();

  // Try to parse the error response even if the request failed
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse API response as JSON: ${responseText}`);
  }

  // Handle the "too early" error case specifically
  if (!response.ok) {
    if (jsonResponse?.description?.includes("timestamp not reached yet")) {
      throw new Error(
        `Cannot decrypt yet: The decryption timestamp has not been reached.\n` +
          `Please wait at least ${DECRYPTION_DELAY} seconds after encryption before attempting to decrypt.\n` +
          `Error details: ${jsonResponse.description}`
      );
    }
    throw new Error(
      `API request failed with status ${response.status}: ${responseText}`
    );
  }

  // Check if we have the message data
  if (!jsonResponse.message) {
    throw new Error(
      `API response missing message data: ${JSON.stringify(jsonResponse)}`
    );
  }

  return jsonResponse.message;
}

export async function getSafesByOwner(ownerAddress: string) {
  const decodedData = await apiKit.getSafesByOwner(ownerAddress);
  return decodedData;
}

export interface SafeBalancesResponse {
  fiatTotal: string;
  items: SafeBalanceItem[];
}

export interface SafeBalanceItem {
  balance: string;
  fiatBalance: string;
  fiatBalance24hChange: string;
  fiatConversion: string;
  tokenInfo: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoUri: string | null;
    type: string;
  };
}

export async function getSafeBalances(
  safeAddress: string,
  chainId: string
): Promise<SafeBalancesResponse> {
  try {
    const url = `https://safe-client.safe.global/v1/chains/${chainId}/safes/${safeAddress}/balances/usd?trusted=false`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch Safe balances: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Safe balances:", error);
    throw error;
  }
}

"use client";
import {
  getTokenBalances,
  createConfig,
  getRoutes,
  executeRoute,
  Route,
  Token,
} from "@lifi/sdk";
import { WalletClient, parseUnits, formatUnits } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useState, useEffect } from "react";

createConfig({
  integrator: "ethlisbon",
});

// Gnosis USDC address
const GNOSIS_USDC = "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83";

async function bridgeAndSwapToUSDC(
  walletClient: WalletClient,
  sourceToken: Token,
  amount: bigint,
) {
  try {
    // 1. Get routes
    const routes = await getRoutes({
      fromChainId: sourceToken.chainId,
      fromTokenAddress: sourceToken.address,
      toChainId: 100, // Gnosis
      toTokenAddress: GNOSIS_USDC,
      fromAmount: amount,
      fromAddress: walletClient.account.address,
      toAddress: walletClient.account.address,
    });

    if (!routes.routes.length) {
      throw new Error("No routes found");
    }

    // 2. Get the best route
    const bestRoute = routes.routes[0];

    // 3. Execute the route
    const result = await executeRoute({
      route: bestRoute,
      walletClient,
    });

    // 4. Wait for transaction
    const receipt = await result.wait();

    return {
      txHash: receipt.transactionHash,
      route: bestRoute,
    };
  } catch (error) {
    console.error("Bridge and swap failed:", error);
    throw error;
  }
}

// Usage example:
async function handleBridgeAndSwap() {
  const sourceToken = {
    address: "0x...", // Your token address
    chainId: 1, // Ethereum mainnet
    decimals: 18,
  };

  const amount = BigInt("1000000000000000000"); // 1 token in wei

  try {
    const result = await bridgeAndSwapToUSDC(walletClient, sourceToken, amount);
    console.log("Success! Transaction hash:", result.txHash);
  } catch (error) {
    console.error("Failed:", error);
  }
}

async function getUserTokens(walletAddress: string) {
  // Get all supported chains
  const chains = await lifi.getChains();

  // Get all supported tokens
  const { tokens } = await lifi.getTokens();

  const userTokens = [];

  // Check each chain
  for (const chain of chains) {
    const chainTokens = tokens[chain.id] || [];

    // Get balances for this chain
    const balances = await getTokenBalances(walletAddress, chainTokens);

    // Filter out zero balances
    const nonZeroBalances = balances.filter((b) => b.amount > 0n);

    userTokens.push(...nonZeroBalances);
  }

  return userTokens;
}

// Initialize LiFi
const lifi = new LiFi({
  integrator: "your-app-name",
});

// Gnosis USDC address
//const GNOSIS_USDC = "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83";

interface TokenBalance {
  address: string;
  chainId: number;
  symbol: string;
  amount: bigint;
  decimals: number;
}

export default function BridgeAndSwap() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [userTokens, setUserTokens] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fetch user's tokens
  useEffect(() => {
    if (!address) return;

    async function fetchTokens() {
      try {
        const chains = await lifi.getChains();
        const { tokens } = await lifi.getTokens();

        const allTokens: TokenBalance[] = [];

        for (const chain of chains) {
          const chainTokens = tokens[chain.id] || [];
          const balances = await lifi.getTokenBalances(address, chainTokens);

          const nonZeroBalances = balances
            .filter((b) => b.amount > 0n)
            .map((b) => ({
              address: b.address,
              chainId: b.chainId,
              symbol: b.symbol,
              amount: b.amount,
              decimals: b.decimals,
            }));

          allTokens.push(...nonZeroBalances);
        }

        setUserTokens(allTokens);
      } catch (err) {
        setError("Failed to fetch tokens");
        console.error(err);
      }
    }

    fetchTokens();
  }, [address]);

  // Handle bridge and swap
  const handleBridgeAndSwap = async () => {
    if (!walletClient || !selectedToken || !amount) return;

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const amountWei = parseUnits(amount, selectedToken.decimals);

      const routes = await lifi.getRoutes({
        fromChainId: selectedToken.chainId,
        fromTokenAddress: selectedToken.address,
        toChainId: 100, // Gnosis
        toTokenAddress: GNOSIS_USDC,
        fromAmount: amountWei,
        fromAddress: address!,
        toAddress: address!,
      });

      if (!routes.routes.length) {
        throw new Error("No routes found");
      }

      const bestRoute = routes.routes[0];

      const result = await lifi.executeRoute({
        route: bestRoute,
        walletClient,
      });

      const receipt = await result.wait();
      setTxHash(receipt.transactionHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Bridge & Swap to USDC</h2>

      {/* Token Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Token</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedToken?.address || ""}
          onChange={(e) => {
            const token = userTokens.find((t) => t.address === e.target.value);
            setSelectedToken(token || null);
          }}
        >
          <option value="">Select a token</option>
          {userTokens.map((token) => (
            <option
              key={`${token.chainId}-${token.address}`}
              value={token.address}
            >
              {token.symbol} (Chain ID: {token.chainId})
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={!selectedToken}
        />
        {selectedToken && (
          <div className="text-sm text-gray-500 mt-1">
            Balance: {formatUnits(selectedToken.amount, selectedToken.decimals)}{" "}
            {selectedToken.symbol}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
        onClick={handleBridgeAndSwap}
        disabled={!selectedToken || !amount || isLoading}
      >
        {isLoading ? "Processing..." : "Bridge & Swap to USDC"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Transaction successful! Hash: {txHash}
        </div>
      )}
    </div>
  );
}

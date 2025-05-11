import { createAndExecuteRoute } from "@/lib/bridging";
import { parse } from "path";
import { useEffect, useRef } from "react";
import {
  Chain,
  Client,
  createWalletClient,
  custom,
  http,
  parseUnits,
} from "viem";
import { createConfig, EVM } from "@lifi/sdk";
import { use } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { arbitrum, mainnet, base, optimism, polygon } from "viem/chains";

export function AgenticBridge({
  fromChainId,
  toChainId,
  fromTokenAddress,
  toTokenAddress,
  fromAmount,
  fromAddress,
  toAddress,
  decimals,
}: {
  fromChainId: string;
  toChainId: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
  decimals: string;
}) {
  console.log("called agentic bridge", fromAddress);
  const amountBigInt = `${parseUnits(fromAmount, 18)}`;
  const fromChainIDNumber = parseInt(fromChainId);
  const toChainIDNumber = parseInt(toChainId);

  const initializedRef = useRef(false);
  const chains = [arbitrum, base, mainnet, optimism, polygon];

  const account = useAccount();
  const client = useWalletClient();

  createConfig({
    integrator: "eth-lisbon-2025",
    providers: [
      EVM({
        getWalletClient: async () => client.data as Client, // Get the wallet client from wagmi
        switchChain: async (chainId) =>
          // Switch chain by creating a new wallet client
          createWalletClient({
            account: account.address,
            chain: chains.find((chain) => chain.id == chainId) as Chain,
            transport: http(),
          }),
      }),
    ],
  });

  useEffect(() => {
    const initalize = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const params = {
        fromChainId: fromChainIDNumber,
        toChainId: toChainIDNumber,
        fromTokenAddress: account.address,
        toTokenAddress: toTokenAddress,
        fromAmount: 110233080746205,
        fromAddress: account.address,
        toAddress: toAddress,
      };

      console.log(
        "%c==>PARAMS",
        "color: green; background: yellow; font-size: 20px",
        params
      );

      const bridge = await createAndExecuteRoute(
        fromChainIDNumber,
        toChainIDNumber,
        fromTokenAddress,
        toTokenAddress,
        amountBigInt,
        fromAddress,
        toAddress
      );

      //   const bridge = await createAndExecuteRoute(
      //     8453,
      //     100,
      //     "0x0000000000000000000000000000000000000000",
      //     "0x0000000000000000000000000000000000000000",
      //     "110233080746205",
      //     "0xde0AAFa4B4848B849B001E49e909C88251eA41FC",
      //     "0xde0AAFa4B4848B849B001E49e909C88251eA41FC"
      //   );

      console.log("bridge", bridge);
    };
    initalize();
  }, [
    fromChainIDNumber,
    toChainIDNumber,
    fromTokenAddress,
    toTokenAddress,
    amountBigInt,
    fromAddress,
    toAddress,
  ]);

  return <div>Bridge Loaded</div>;
}

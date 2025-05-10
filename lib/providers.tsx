"use client";

import React from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { chiadoNetwork, sepoliaNetwork } from "./evmNetworks";

import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  // ensure our API key is defined as a string
  const dynamicApiKey = process.env.NEXT_PUBLIC_DYNAMIC_API_KEY;
  if (!dynamicApiKey) {
    throw new Error("Missing NEXT_PUBLIC_DYNAMIC_API_KEY environment variable");
  }

  return (
    <DynamicContextProvider
      theme="light"
      settings={{
        environmentId: dynamicApiKey,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (dashboardNetworks) => {
            const gnosisMainnet = dashboardNetworks.find(
              (n) => n.chainId === 100
            );
            const others = dashboardNetworks.filter((n) => n.chainId !== 100);
            const hasChiado = dashboardNetworks.some(
              (n) => n.chainId === chiadoNetwork.chainId
            );

            const hasSepolia = dashboardNetworks.some(
              (n) => n.chainId === sepoliaNetwork.chainId
            );

            return [
              ...(gnosisMainnet ? [gnosisMainnet] : []),
              ...others,
              ...(hasChiado ? [] : [chiadoNetwork]),
              ...(hasSepolia ? [] : [sepoliaNetwork]),
            ];
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

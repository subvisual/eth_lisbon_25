"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "./wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { SsrWrapper } from "@/app/components/ssr-wrapper";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SsrWrapper>
          <RainbowKitProvider
            showRecentTransactions={true}
            modalSize="compact"
            initialChain={sepolia}
          >
            {children}
          </RainbowKitProvider>
        </SsrWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

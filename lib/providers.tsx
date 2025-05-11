"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "./wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { sepolia, gnosis } from "wagmi/chains";
import { SsrWrapper } from "@/app/components/ssr-wrapper";
import { createContext, useContext, useState } from "react";

const queryClient = new QueryClient();

// Safe context for global safe address state
type SafeContextType = {
  selectedSafe: string | undefined;
  setSelectedSafe: (safe: string | undefined) => void;
};

const SafeContext = createContext<SafeContextType | undefined>(undefined);

export function useSafe() {
  const context = useContext(SafeContext);
  if (!context) {
    throw new Error("useSafe must be used within a SafeProvider");
  }
  return context;
}

function SafeProvider({ children }: { children: React.ReactNode }) {
  const [selectedSafe, setSelectedSafe] = useState<string | undefined>();

  return (
    <SafeContext.Provider value={{ selectedSafe, setSelectedSafe }}>
      {children}
    </SafeContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SsrWrapper>
          <RainbowKitProvider
            showRecentTransactions={true}
            modalSize="compact"
            initialChain={gnosis}
          >
            <SafeProvider>{children}</SafeProvider>
          </RainbowKitProvider>
        </SsrWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

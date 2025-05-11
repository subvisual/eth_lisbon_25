"use client";

import React from "react";
import { AIChat } from "./components/AIChat";
import { useSafe } from "@/lib/providers";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";

export default function HomePage() {
  const { selectedSafe } = useSafe();
  const { chain } = useAccount();

  if (!selectedSafe) {
    return null;
  }

  return <AIChat safeAddress={selectedSafe} chainId={chain.id} />;
}

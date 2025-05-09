import React from "react";

import { mockGnosisYield } from "@/lib/yield_strategist/api/defillama";

import { ollamaChat } from "@/lib/yield_strategist/api/ollama";
// Using the async keyword correctly for a Next.js page component
export default async function YieldStrategistPage() {
  //   const gnosisData = await fetchGnosisYieldData();

  const gnosisData = mockGnosisYield();

  const apyMessages = [
    {
      role: "user",
      content: "Tell me the APY yields for SDAI in gnosis.",
    },
  ];

  const addr = "0xeD647c579Fa34F2890a1daC49B5125068f2E6aDd";

  const balanceMessages = [
    {
      role: "user",
      content: `Check the current balance for my vault (address: ${addr}).`,
    },
  ];

  const ollamaApyResponse = await ollamaChat(apyMessages);
  const ollamaBalanceResponse = await ollamaChat(balanceMessages);

  return (
    <div className="min-h-screen p-4">
      <pre>{JSON.stringify(ollamaApyResponse, null, 2)}</pre>
      <pre>{JSON.stringify(ollamaBalanceResponse, null, 2)}</pre>
      <pre className="overflow-auto">{JSON.stringify(gnosisData, null, 2)}</pre>
    </div>
  );
}

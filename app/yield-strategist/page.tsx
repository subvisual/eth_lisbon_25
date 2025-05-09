import React from "react";

import ollama from "ollama";

import {
  fetchGnosisYieldData,
  mockGnosisYield,
} from "@/lib/yield_strategist/api/defillama";
import {
  getGnosisYield,
  getGnosisYieldTool,
  getJsonFieldTool,
} from "@/lib/yield_strategist/ollama/tools";
import { ollamaChat } from "@/lib/yield_strategist/api/ollama";
// Using the async keyword correctly for a Next.js page component
export default async function YieldStrategistPage() {
  //   const gnosisData = await fetchGnosisYieldData();

  const gnosisData = mockGnosisYield();

  const messages = [
    {
      role: "user",
      content: "what is the current WSTETH apy? ",
    },
  ];
  const model = "qwen3:8b";

  const ollamaResponse = await ollamaChat(messages);

  return (
    <div className="min-h-screen p-4">
      <pre>{JSON.stringify(ollamaResponse, null, 2)}</pre>
      <pre className="overflow-auto">{JSON.stringify(gnosisData, null, 2)}</pre>
    </div>
  );
}

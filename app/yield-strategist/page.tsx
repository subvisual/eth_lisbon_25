import React from "react";

import { mockGnosisYield } from "@/lib/yield_strategist/api/defillama";

import { ollamaChat } from "@/lib/yield_strategist/api/ollama";
// Using the async keyword correctly for a Next.js page component
export default async function YieldStrategistPage() {
  //   const gnosisData = await fetchGnosisYieldData();

  const gnosisData = mockGnosisYield();

  const messages = [
    {
      role: "user",
      content: `
I need you to fetch the current yield data for sDAI (Savings DAI) from the DeFi Llama API and interpret the results. Use the /pools endpoint from DeFi Llama's API to get yield information. When you receive the JSON response, look for the entry where 'symbol' is 'SDAI' and 'chain' is 'Gnosis'.

When interpreting the JSON response, focus on these key fields:

The 'apy' field (currently 5.32947%) represents the total annual percentage yield for sDAI, which is the primary metric for yield performance.

The 'tvlUsd' field (currently $83,841,015) shows the Total Value Locked in USD, indicating the size of the sDAI pool.

The 'apyPct' fields show recent yield changes:

'apyPct1D' (-0.086%) indicates the APY change over the last day

'apyPct7D' (-2.14902%) indicates the APY change over the last week

'apyPct30D' (-0.26868%) indicates the APY change over the last month

Negative values mean the yield has decreased over that period

The 'stablecoin' field (true) confirms this is a stablecoin-based yield product.

The 'ilRisk' field ('no') indicates there is no impermanent loss risk.

The 'exposure' field ('single') means this is a single asset exposure rather than a pair or pool.

The 'predictions' object contains forecasting data:

'predictedClass' ('Down') suggests the yield is expected to decrease

'predictedProbability' (52%) indicates the confidence level of this prediction

'binnedConfidence' (1) represents a low confidence level in the prediction

Please provide the current APY for sDAI, how it has changed over different time periods, and a brief analysis of whether this yield appears stable or volatile based on the historical changes.
      `,
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

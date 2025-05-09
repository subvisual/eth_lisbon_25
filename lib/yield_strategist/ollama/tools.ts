import { getSafeBalances } from "@/lib/api";
import { mockGnosisYield } from "../api/defillama";

export function getGnosisYield() {
  const data = mockGnosisYield();

  return JSON.stringify(data);
}

export async function checkSafeBalances({ addr }: { addr: string }) {
  const balance = await getSafeBalances(addr);

  return JSON.stringify(balance, null, 2);
}

export const getGnosisYieldTool = {
  type: "function",
  function: {
    name: "getGnosisYield",
    description: "Gets yields for liquidity pools on gnosis.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

export const checkSafeBalancesTool = {
  type: "function",
  function: {
    name: "checkSafeBalances",
    description: "Displays the balances of the currently selected safe.",
    parameters: {
      type: "object",
      required: ["addr"],
      properties: {
        addr: { type: "number", description: "The ethereum vault address." },
      },
    },
  },
};

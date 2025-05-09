import { getSafeBalances } from "@/lib/api";
import { mockGnosisYield } from "../api/defillama";

interface OllamaToolsArg {
  type: string;
  description: string;
}

interface OllamaTools {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      required: string[];
      properties: Record<string, OllamaToolsArg>;
    };
  };
}

interface OllamaFunctions {
  [key: string]: Function;
}

interface Toolbelt {
  tools: OllamaTools[];
  functions: OllamaFunctions;
}

export const toolbelt: Toolbelt = {
  tools: [
    {
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
    },
    {
      type: "function",
      function: {
        name: "checkSafeBalances",
        description: "Displays the balances of the currently selected safe.",
        parameters: {
          type: "object",
          required: ["addr"],
          properties: {
            addr: {
              type: "string",
              description: "The ethereum vault address.",
            },
          },
        },
      },
    },
  ],
  functions: {
    getGnosisYield: getGnosisYield,
    checkSafeBalances: checkSafeBalances,
  },
};

export function getGnosisYield() {
  const data = mockGnosisYield();

  return JSON.stringify(data);
}

export async function checkSafeBalances({ addr }: { addr: string }) {
  const balance = await getSafeBalances(addr);

  return JSON.stringify(balance);
}

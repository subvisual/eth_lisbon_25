import { getSafeBalances } from "@/lib/api";
import { mockGnosisYield } from "../api/defillama";
import strategies from "../../../scrapping/delta-neutral.json";

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
        description:
          "Retrieves current yields and APRs for liquidity pools specifically on the Gnosis chain. Use this when asked about yields, APRs, returns, or investment opportunities on Gnosis.",
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
        description:
          "Fetches and displays the token balances of a specific Gnosis Safe wallet address. Use this when asked about account balance, holdings, or assets in a specific Safe.",
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
    {
      type: "function",
      function: {
        name: "checkStrategies",
        description:
          "Shows the optimal yield strategies and investment opportunities currently available. Use this when asked about the best strategies, investment recommendations, or delta-neutral approaches.",
        parameters: {
          type: "object",
          required: [],
          properties: {},
        },
      },
    },
  ],
  functions: {
    getGnosisYield: getGnosisYield,
    checkSafeBalances: checkSafeBalances,
    checkStrategies: checkStrategies,
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

export async function checkStrategies() {
  return JSON.stringify(strategies);
}

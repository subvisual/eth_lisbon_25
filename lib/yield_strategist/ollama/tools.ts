import { getSafeBalances } from "@/lib/api";
import strategies from "../../../scrapping/delta-neutral.json";
import { fetchGnosisYieldData } from "../api/defillama";

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
    getGnosisYield: getGnosisPoolYield,
    getGnosisSafeBalances: getGnosisSafeBalances,
    getYieldStrategies: getYieldStrategies,
  },
};

export async function getGnosisPoolYield({
  tokens = [],
}: { tokens?: string[] } = {}) {
  console.log("pool yield checker called!");
  const data = await fetchGnosisYieldData();

  // Filter data to only include pools with the requested tokens
  let filteredData = data;

  if (tokens && tokens.length > 0) {
    filteredData = data.filter((item) => {
      // Check if any of the tokens in the pool match the requested tokens
      const poolTokens = [item.symbol].flat().filter(Boolean);
      return tokens.some((token) =>
        poolTokens.some((poolToken) =>
          poolToken.toLowerCase().includes(token.toLowerCase())
        )
      );
    });
  }

  return JSON.stringify(filteredData);
}

export async function getGnosisSafeBalances({
  addr,
  chainId,
}: {
  addr: string;
  chainId: string;
}) {
  console.log("balance checker called!");
  const balance = await getSafeBalances(addr, chainId);

  balance.items.forEach((token) => {
    token.formattedBalance =
      token.balance / Math.pow(10, token.tokenInfo.decimals);
  });

  return JSON.stringify(balance);
}

export async function getYieldStrategies() {
  console.log("yield strategies checker called!");
  return JSON.stringify(strategies);
}

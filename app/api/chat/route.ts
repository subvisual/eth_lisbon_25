import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";
import {
  getGnosisSafeBalances,
  getGnosisPoolYield,
  getYieldStrategies,
} from "@/lib/yield_strategist/ollama/tools";

const strategistTools = {
  getGnosisPoolsYield: tool({
    description: "Gets yields for liquidity pools on gnosis.",
    parameters: z.object({
      tokens: z
        .array(z.string())
        .describe("The tokens to get yields for, e.g., ['ETH', 'DAI']"),
    }),
    execute: async ({ tokens }) =>
      JSON.parse(await getGnosisPoolYield({ tokens })),
  }),
  getGnosisSafeBalances: tool({
    description: "Displays the balances of the currently selected safe.",
    parameters: z.object({
      addr: z.string().describe("The ethereum vault address."),
    }),
    execute: async ({ addr }) =>
      JSON.parse(await getGnosisSafeBalances({ addr })),
  }),
  getYieldStrategies: tool({
    description: "Shows the optimal yield strategies currently available.",
    parameters: z.object({}),
    execute: async () => JSON.parse(await getYieldStrategies()),
  }),
  sendTransaction: tool({
    description: "Sends a transaction to the another wallet.",
    parameters: z.object({
      to: z.string().describe("The address to send the transaction to."),
      value: z.string().describe("The value of the transaction."),
      tokenInfo: z.object({
        symbol: z.string().describe("The symbol of the token."),
        address: z.string().describe("The address of the contract."),
        decimals: z.number().describe("The number of decimals of the token."),
      }),
    }),
    execute: async ({ to, value, tokenInfo }) => {
      console.log(to, value, tokenInfo);
      return {
        symbol: tokenInfo.symbol,
        contractAddress: tokenInfo.address,
        to,
        value,
        decimals: tokenInfo.decimals,
      };
    },
  }),
};

// type OpenAIChatModelId = 'o1' | 'o1-2024-12-17' | 'o1-mini' | 'o1-mini-2024-09-12' | 'o1-preview' | 'o1-preview-2024-09-12' | 'o3-mini' | 'o3-mini-2025-01-31' | 'o3' | 'o3-2025-04-16' | 'o4-mini' | 'o4-mini-2025-04-16' | 'gpt-4.1' | 'gpt-4.1-2025-04-14' | 'gpt-4.1-mini' | 'gpt-4.1-mini-2025-04-14' | 'gpt-4.1-nano' | 'gpt-4.1-nano-2025-04-14' | 'gpt-4o' | 'gpt-4o-2024-05-13' | 'gpt-4o-2024-08-06' | 'gpt-4o-2024-11-20' | 'gpt-4o-audio-preview' | 'gpt-4o-audio-preview-2024-10-01' | 'gpt-4o-audio-preview-2024-12-17' | 'gpt-4o-search-preview' | 'gpt-4o-search-preview-2025-03-11' | 'gpt-4o-mini-search-preview' | 'gpt-4o-mini-search-preview-2025-03-11' | 'gpt-4o-mini' | 'gpt-4o-mini-2024-07-18' | 'gpt-4-turbo' | 'gpt-4-turbo-2024-04-09' | 'gpt-4-turbo-preview' | 'gpt-4-0125-preview' | 'gpt-4-1106-preview' | 'gpt-4' | 'gpt-4-0613' | 'gpt-4.5-preview' | 'gpt-4.5-preview-2025-02-27' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-1106' | 'chatgpt-4o-latest' | (string & {});

const minModel = openai("gpt-4.1-mini");
const nanoModel = openai("gpt-4.1-nano");

export async function POST(req: Request) {
  const { messages } = await req.json();
  const encoder = new TextEncoder();

  const result = await generateText({
    model: nanoModel,
    messages,
    tools: strategistTools,
    maxSteps: 5,
    toolChoice: "auto",
  });

  // Extract tool calls and results from steps
  let extractedToolCalls = [];
  let extractedToolResults = [];

  // If steps array exists and has entries
  if (result.steps && result.steps.length > 0) {
    for (const step of result.steps) {
      // Collect tool calls from step
      if (step.toolCalls && step.toolCalls.length > 0) {
        extractedToolCalls = extractedToolCalls.concat(step.toolCalls);
      }

      // Collect tool results from step
      if (step.toolResults && step.toolResults.length > 0) {
        extractedToolResults = extractedToolResults.concat(step.toolResults);
      }
    }
  }

  // Create a Response with both the text result and extracted tool data
  return new Response(
    JSON.stringify({
      content: result.text,
      toolCalls: extractedToolCalls,
      toolResults: extractedToolResults,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

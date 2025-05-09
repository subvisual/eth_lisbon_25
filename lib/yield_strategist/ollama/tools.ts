import { getSafeBalances } from "@/lib/api";
import { mockGnosisYield } from "../api/defillama";

import { z } from "zod";

export function getGnosisYield() {
  const data = mockGnosisYield();

  // Find the sDAI yield information
  const sdaiYieldData = data.filter((item) => item.symbol === "WSTETH")[0];
  console.log("sDAI yield data:", sdaiYieldData);

  return JSON.stringify(sdaiYieldData);
}

export const getJsonFieldTool = {
  type: "function",
  function: {
    name: "getJsonField",
    description:
      "Extracts a specific field from a JSON object using dot notation path",
    parameters: {
      type: "object",
      properties: {
        json: {
          type: "object",
          description: "The JSON object to extract data from",
        },
        path: {
          type: "string",
          description:
            "Path to the field using dot notation (e.g. 'user.address.street')",
        },
      },
      required: ["json", "path"],
    },
  },
};

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

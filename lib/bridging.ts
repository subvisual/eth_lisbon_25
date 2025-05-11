import { createConfig, EVM } from "@lifi/sdk";
import {
  convertQuoteToRoute,
  executeRoute,
  getQuote,
  getRoutes,
} from "@lifi/sdk";
import { useAccount } from "wagmi";

async function createRouteRequest(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
  fromAddress: string,
  toAddress: string
) {
  const routesRequest = {
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount,
    fromAddress,
    toAddress,
  };

  const result = await getRoutes(routesRequest);
  const routes = result.routes;

  return routes;
}

export async function createAndExecuteRoute(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
  fromAddress: string,
  toAddress: string
) {
  const routes = await createRouteRequest(
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount,
    fromAddress,
    toAddress
  );

  if (routes.length === 0) {
    return null;
  }

  const route = routes[0];
  console.log("Route", routes);
  console.log("Route", routes[0]);

  return await executeRoute(route, {
    // Gets called once the route object gets new updates
    updateRouteHook(route) {
      console.log(route);
    },
  });
}

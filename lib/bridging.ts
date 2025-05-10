import { createConfig } from '@lifi/sdk'
import { convertQuoteToRoute, executeRoute, getQuote, getRoutes } from '@lifi/sdk';

createConfig({
  integrator: 'eth-lisbon-2025',
})


async function createRouteRequest(fromChainId: number, toChainId: number, fromTokenAddress: string, toTokenAddress: string, fromAmount: string) {
  const routesRequest: RoutesRequest = {
    fromChainId, 
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount
  };

  const result = await getRoutes(routesRequest);
  const routes = result.routes;

  return routes
}



async function executeRoute(route: Route, fromAddress: string) {
  const executeRequest: ExecuteRequest = {
    route,
    fromAddress
  };

  return await executeRoute(route)
}

async function createAndExecuteRoute(fromChainId: number, toChainId: number, fromTokenAddress: string, toTokenAddress: string, fromAmount: string, fromAddress: string) {
  const routes = await createRouteRequest(fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount);

  if (routes.length === 0) {
    return null;
  }

  const route = routes[0]; 

  return await executeRoute(route, fromAddress);
}



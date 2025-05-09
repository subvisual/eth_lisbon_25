'use client';

import React from 'react';
import {
  DynamicContextProvider,
  type EvmNetwork,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

const chiadoNetwork: EvmNetwork = {
  chainId: 10200,
  networkId: 10200,
  name: 'Chiado',
  chainName: 'Chiado',
  vanityName: 'Chiado',
  rpcUrls: ['https://rpc.chiado.gnosis.gateway.fm'],
  blockExplorerUrls: ['https://gnosis-chiado.blockscout.com'],
  iconUrls: ['https://app.dynamic.xyz/assets/networks/gnosis.svg'],
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'XDAI',
    decimals: 18,
    iconUrl: 'https://app.dynamic.xyz/assets/networks/gnosis.svg',
  },
};

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // ensure our API key is defined as a string
  const dynamicApiKey = process.env.NEXT_PUBLIC_DYNAMIC_API_KEY;
  if (!dynamicApiKey) {
    throw new Error('Missing NEXT_PUBLIC_DYNAMIC_API_KEY environment variable');
  }

  return (
    <DynamicContextProvider
      theme="light"
      settings={{
        environmentId: dynamicApiKey,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (dashboardNetworks) => {
            const gnosisMainnet = dashboardNetworks.find(
              (n) => n.chainId === 100
            );
            const others = dashboardNetworks.filter((n) => n.chainId !== 100);
            const hasChiado = dashboardNetworks.some(
              (n) => n.chainId === chiadoNetwork.chainId
            );

            return [
              ...(gnosisMainnet ? [gnosisMainnet] : []),
              ...others,
              ...(hasChiado ? [] : [chiadoNetwork]),
            ];
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

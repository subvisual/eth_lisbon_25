import {
  type EvmNetwork,
} from '@dynamic-labs/sdk-react-core';

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


export const sepoliaNetwork: EvmNetwork = {
  chainId: 11155111,
  networkId: 11155111,
  name: 'Sepolia',
  chainName: 'Sepolia',
  vanityName: 'Sepolia',
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  iconUrls: ['https://app.dynamic.xyz/assets/networks/sepolia.svg'],
  nativeCurrency: {
    name: 'Sepolia',
    symbol: 'ETH',
    decimals: 18,
    iconUrl: 'https://app.dynamic.xyz/assets/networks/sepolia.svg',
  },
};

export { chiadoNetwork };

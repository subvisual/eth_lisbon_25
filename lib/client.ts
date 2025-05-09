'use client';

import { http, createPublicClient, createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'


export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

// export const walletClient = createWalletClient({
//   chain: sepolia,
//   transport: custom(window.ethereum),
// })

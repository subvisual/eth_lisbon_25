
import { getContract } from 'viem'
import { aavePoolV3Abi } from '../constants/abi/aavePoolV3'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { message } from 'antd';
import { getSigner } from '@dynamic-labs/ethers-v6';
import { publicClient } from '@/lib/client';
import { walletClient } from '@/lib/client';
import { waitForCallsStatus } from 'viem/experimental';

export default async function Supply() {
const { primaryWallet } = useDynamicContext();

const contract = await getContract({
  address: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
  abi: aavePoolV3Abi,
  client: publicClient,
})

const list = await contract.read.getReservesList();
console.log(list);

// const address = await walletClient.getAddresses();
// const result = await contract.read.totalSupply();

return <div>
  <h1>Supply</h1>
  <p>{list[0]}</p>
</div>
}

import SafeApiKit from "@safe-global/api-kit";
import { sepoliaNetwork } from "./evmNetworks";
export const apiKit = new SafeApiKit({
  chainId: BigInt(sepoliaNetwork.chainId),
});

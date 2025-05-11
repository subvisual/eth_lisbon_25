import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import {
    aaveSupplyTxBuilder,
    approveErc20TxBuilder,
    encodeMultiSend,
} from "./transactionsBuilder";
import type { SupplyFormValues } from "@/app/components/AaveSupply";

export const aaveSupply = (values: SupplyFormValues, accountAddress: string, safeAddress: string) => {
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const supplyTokenAddress = values.supplyAddress;
	const supplyTokenDecimals = 18;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const supplyAmount = (
		values.supplyAmount *
		10 ** supplyTokenDecimals
	).toString();

    const approveTx = approveErc20TxBuilder(
        aavePoolV3Address,
        supplyTokenAddress,
        supplyAmount,
    );

	const aaveSupplyTx = aaveSupplyTxBuilder(
		aavePoolV3Address,
		supplyTokenAddress,
		safeAddress,
		supplyAmount,
	);

	const safeTxs = [approveTx, aaveSupplyTx];

	const encodedSafeMultiSend = encodeMultiSend(safeTxs);

	const safeMultiSendData = encodeFunctionData({
		functionName: "multiSend",
		args: [encodedSafeMultiSend as `0x${string}`],
		abi: multiSendAbi,
	});

	return { safeMultiSendData };
};

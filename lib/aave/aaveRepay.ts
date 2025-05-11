import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import {
    aaveRepayTxBuilder,
    approveErc20TxBuilder,
    encodeMultiSend,
} from "./transactionsBuilder";
import type { RepayFormValues } from "@/app/components/AaveRepay";

export const aaveRepay = (values: RepayFormValues, accountAddress: string, safeAddress: string, repayDecimals: number) => {
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const repayTokenAddress = values.repayAddress;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const repayAmount = (
		values.repayAmount *
		10 ** repayDecimals
	).toString();

    const approveTx = approveErc20TxBuilder(
        aavePoolV3Address,
        repayTokenAddress,
        repayAmount,
    );

	const aaveRepayTx = aaveRepayTxBuilder(
		aavePoolV3Address,
		repayTokenAddress,
		safeAddress,
		repayAmount,
	);

	console.log(aaveRepayTx.data);
	const safeTxs = [approveTx, aaveRepayTx];

	const encodedSafeMultiSend = encodeMultiSend(safeTxs);

	const safeMultiSendData = encodeFunctionData({
		functionName: "multiSend",
		args: [encodedSafeMultiSend as `0x${string}`],
		abi: multiSendAbi,
	});

	return { safeMultiSendData };
};

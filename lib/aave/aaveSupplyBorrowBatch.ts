import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import {
	aaveSupplyTxBuilder,
	aaveBorrowTxBuilder,
	transferFromErc20TxBuilder,
	encodeMultiSend,
	approveErc20TxBuilder,
} from "./transactionsBuilder";
import type { FormValues } from "@/app/components/Aave";

export const aaveSupplyBorrowBatch = (values: FormValues, accountAddress: string, safeAddress: string, supplyDecimals: number, borrowDecimals: number) => {
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const supplyTokenAddress = values.supplyAddress;
	const borrowTokenAddress = values.borrowAddress;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const supplyAmount = (
		values.supplyAmount *
		10 ** supplyDecimals
	).toString();
	const borrowAmount = (
		values.borrowAmount *
		10 ** borrowDecimals
	).toString();

    const approveTx = approveErc20TxBuilder(
        aavePoolV3Address,
        supplyTokenAddress,
        supplyAmount,
    );

	const transferFromErc20Tx = transferFromErc20TxBuilder(
		supplyTokenAddress,
		accountAddress,
		safeAddress,
		supplyAmount,
	);
	const aaveSupplyTx = aaveSupplyTxBuilder(
		aavePoolV3Address,
		supplyTokenAddress,
		safeAddress,
		supplyAmount,
	);
	const aaveBorrowTx = aaveBorrowTxBuilder(
		aavePoolV3Address,
		borrowTokenAddress,
		safeAddress,
		borrowAmount,
	);
	const safeTxs = [approveTx, transferFromErc20Tx, aaveSupplyTx, aaveBorrowTx];

	const encodedSafeMultiSend = encodeMultiSend(safeTxs);

	const safeMultiSendData = encodeFunctionData({
		functionName: "multiSend",
		args: [encodedSafeMultiSend as `0x${string}`],
		abi: multiSendAbi,
	});

	return { safeMultiSendData };
};

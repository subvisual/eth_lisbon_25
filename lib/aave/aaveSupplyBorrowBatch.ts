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

export const aaveSupplyBorrowBatch = (values: FormValues, accountAddress: string) => {
	const safeAddress = addresses.safeAddress;
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const supplyTokenAddress = values.supplyAddress;
	const supplyTokenDecimals = 18;
	const borrowTokenAddress = values.borrowAddress;
	const borrowTokenDecimals = 6;


	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const supplyAmount = (
		values.supplyAmount *
		10 ** supplyTokenDecimals
	).toString();
	const borrowAmount = (
		values.borrowAmount *
		10 ** borrowTokenDecimals
	).toString();

    const approveTx = approveErc20TxBuilder(
        aavePoolV3Address,
        supplyTokenAddress,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
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

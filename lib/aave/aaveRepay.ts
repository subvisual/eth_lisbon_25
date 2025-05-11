import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import { ethers } from "ethers";
import {
	aaveSupplyTxBuilder,
	aaveBorrowTxBuilder,
	type MetaTransaction,
	transferFromErc20TxBuilder,
    aaveRepayTxBuilder,
    approveErc20TxBuilder,
} from "./transactionsBuilder";
import type { RepayFormValues } from "@/app/components/AaveRepay";

export const aaveRepay = (values: RepayFormValues, accountAddress: string) => {
	const safeAddress = addresses.safeAddress;
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const repayTokenAddress = values.repayAddress;
	const repayTokenDecimals = 6;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const repayAmount = (
		values.repayAmount *
		10 ** repayTokenDecimals
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

export const encodeMultiSend = (txs: MetaTransaction[]): string => {
	return `0x${txs.map((tx) => encodeMetaTransaction(tx)).join("")}`;
};

export const encodeMetaTransaction = (tx: MetaTransaction): string => {
	const data = ethers.getBytes(tx.data);
	const encoded = ethers.solidityPacked(
		["uint8", "address", "uint256", "uint256", "bytes"],
		[tx.operation, tx.to, tx.value, data.length, data],
	);
	return encoded.slice(2);
};

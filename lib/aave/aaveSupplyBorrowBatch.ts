import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import { ethers } from "ethers";
import {
	aaveSupplyTxBuilder,
	aaveBorrowTxBuilder,
	type MetaTransaction,
	transferFromErc20TxBuilder,
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
	const safeTxs = [transferFromErc20Tx, aaveSupplyTx, aaveBorrowTx];

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

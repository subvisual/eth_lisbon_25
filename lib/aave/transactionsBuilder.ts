import { erc20Abi } from "@/app/constants/abi/erc20";
import { encodeFunctionData } from "viem";
import type { BigNumberish } from "ethers";
import { aavePoolV3Abi } from "@/app/constants/abi/aavePoolV3";

export interface MetaTransaction {
	to: string;
	value: BigNumberish;
	data: string;
	operation: number;
}

export const approveErc20TxBuilder = (
	spenderAddress: string,
	tokenAddress: string,
	amount: string,
) => {
	const approveErc20TxData = encodeFunctionData({
		functionName: "approve",
		args: [spenderAddress, amount],
		abi: erc20Abi,
	});

	const aprooveTx: MetaTransaction = {
		to: tokenAddress,
		data: approveErc20TxData,
		value: BigInt(0),
		operation: 0,
	};

	return aprooveTx;
};

export const transferErc20TxBuilder = (
	tokenAddress: string,
	toAddress: string,
	amount: string,
) => {
	const transferErc20TxData = encodeFunctionData({
		functionName: "transfer",
		args: [toAddress, amount],
		abi: erc20Abi,
	});

	const transferErc20Tx: MetaTransaction = {
		to: tokenAddress,
		data: transferErc20TxData,
		value: BigInt(0),
		operation: 0,
	};

	return transferErc20Tx;
};

export const transferFromErc20TxBuilder = (
	tokenAddress: string,
	fromAddress: string,
	toAddress: string,
	amount: string,
) => {
	const transferFromErc20TxData = encodeFunctionData({
		functionName: "transferFrom",
		args: [fromAddress, toAddress, amount],
		abi: erc20Abi,
	});

	const transferFromErc20Tx: MetaTransaction = {
		to: tokenAddress,
		data: transferFromErc20TxData,
		value: BigInt(0),
		operation: 0,
	};

	return transferFromErc20Tx;
};

export const aaveSupplyTxBuilder = (
	aavePoolV3Address: string,
	supplyTokenAddress: string,
	safeAddress: string,
	amount: string,
) => {
	const supplyTxData = encodeFunctionData({
		functionName: "supply",
		args: [supplyTokenAddress, BigInt(amount), safeAddress, 0],
		abi: aavePoolV3Abi,
	});

	const supplyTx: MetaTransaction = {
		to: aavePoolV3Address,
		data: supplyTxData,
		value: BigInt(0),
		operation: 0,
	};

	return supplyTx;
};

export const aaveBorrowTxBuilder = (
	aavePoolV3Address: string,
	borrowTokenAddress: string,
	safeAddress: string,
	amount: string,
) => {
	const borrowTxData = encodeFunctionData({
		functionName: "borrow",
		args: [borrowTokenAddress, BigInt(amount), BigInt(2), 0, safeAddress],
		abi: aavePoolV3Abi,
	});

	const borrowTx: MetaTransaction = {
		to: aavePoolV3Address,
		data: borrowTxData,
		value: BigInt(0),
		operation: 0,
	};

	return borrowTx;
};

export const aaveRepayTxBuilder = (
	aavePoolV3Address: string,
	borrowTokenAddress: string,
	safeAddress: string,
	amount: string,
) => {
	const repayTxData = encodeFunctionData({
		functionName: "repay",
		args: [borrowTokenAddress, BigInt(amount), BigInt(2), safeAddress],
		abi: aavePoolV3Abi,
	});

	const repayTx: MetaTransaction = {
		to: aavePoolV3Address,
		data: repayTxData,
		value: BigInt(0),
		operation: 0,
	};

	return repayTx;
};

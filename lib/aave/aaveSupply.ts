import addresses from "@/app/constants/adresses.json";
import { encodeFunctionData } from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import { ethers } from "ethers";
import {
	type MetaTransaction,
    aaveSupplyTxBuilder,
    approveErc20TxBuilder,
} from "./transactionsBuilder";
import type { SupplyFormValues } from "@/app/components/AaveSupply";

export const aaveSupply = (values: SupplyFormValues, accountAddress: string) => {
	const safeAddress = addresses.safeAddress;
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

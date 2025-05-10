import addresses from "@/app/constants/adresses.json";
import {
	encodeAbiParameters,
	encodeFunctionData,
	parseAbiParameters,
} from "viem";
import { multiSendAbi } from "@/app/constants/abi/multiSend";
import { safeAccountAbi } from "@/app/constants/abi/safeAccount";
import { ethers } from "ethers";
import {
	approveErc20TxBuilder,
	aaveSupplyTxBuilder,
	aaveBorrowTxBuilder,
	type MetaTransaction,
  transferErc20TxBuilder,
} from "./transactionsBuilder";

export const transactionBuilder = () => {
	const safeAddress = addresses.safeAddress;
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const supplyTokenAddress = addresses.supplyAddress;
	const borrowTokenAddress = addresses.borrowAddress;
	const multiSendAddress = addresses.multiSendAddress;
	const userAddress = addresses.userAddress;
	const userAddressSignature = addresses.userAddressSignature as `0x${string}`;
	const nullAddress = "0x0000000000000000000000000000000000000000";
	
  // const addressSignature = encodeAbiParameters(
	//   parseAbiParameters('address user, bool approved'),
	//   [addresses.userAddress, true]
	// );

	const aproveErc20Tx = approveErc20TxBuilder(
		safeAddress,
		supplyTokenAddress,
		"1000000000000000000",
	);

	const aaveSupplyTx = aaveSupplyTxBuilder(
		aavePoolV3Address,
		supplyTokenAddress,
		safeAddress,
		"100000000000000000",
	);

	const aaveBorrowTx = aaveBorrowTxBuilder(
		aavePoolV3Address,
		borrowTokenAddress,
		safeAddress,
		"10000000",
	);

	const safeTxs = [aproveErc20Tx, aaveSupplyTx, aaveBorrowTx];

	const encodedSafeMultiSend = encodeMultiSend(safeTxs);
  console.log("encodedSafeMultiSend", encodedSafeMultiSend);

	const safeExecuteTxData = encodeFunctionData({
		functionName: "execTransaction",
		args: [
			multiSendAddress,
			BigInt(0),
			encodedSafeMultiSend as `0x${string}`,
			1,
			BigInt(0),
			BigInt(0),
			BigInt(0),
			nullAddress,
			nullAddress,
			userAddressSignature,
		],
		abi: safeAccountAbi,
	});

  const safeExecuteTx: MetaTransaction = {
    to: safeAddress,
    data: safeExecuteTxData,
    value: BigInt(0),
    operation: 1,
  };

  const transferErc20Tx = transferErc20TxBuilder(
    supplyTokenAddress,
    safeAddress,
    "100000000000000000",
  );
  
  const encodedMultiSendTx = encodeMultiSend([transferErc20Tx, safeExecuteTx]);
  
	return { encodedMultiSendTx };
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

import addresses from "@/app/constants/adresses.json";
import {
    aaveBorrowTxBuilder,
} from "./transactionsBuilder";
import type { BorrowFormValues } from "@/app/components/AaveBorrow";

export const aaveBorrow = (values: BorrowFormValues, accountAddress: string, safeAddress: string, borrowDecimals: number) => {
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const borrowTokenAddress = values.borrowAddress;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const borrowAmount = (
		values.borrowAmount *
		10 ** borrowDecimals
	).toString();

	const aaveBorrowTx = aaveBorrowTxBuilder(
		aavePoolV3Address,
		borrowTokenAddress,
		safeAddress,
		borrowAmount,
	);

	return { aaveBorrowTx };
};

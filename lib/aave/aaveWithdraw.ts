import addresses from "@/app/constants/adresses.json";
import {
    aaveWithdrawTxBuilder,
} from "./transactionsBuilder";
import type { WithdrawFormValues } from "@/app/components/AaveWithdraw";

export const aaveWithdraw = (values: WithdrawFormValues, accountAddress: string, safeAddress: string, withdrawDecimals: number) => {
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const withdrawTokenAddress = values.withdrawAddress;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const withdrawAmount = (
		values.withdrawAmount *
		10 ** withdrawDecimals
	).toString();

	const aaveWithdrawTx = aaveWithdrawTxBuilder(
		aavePoolV3Address,
		withdrawTokenAddress,
		safeAddress,
		withdrawAmount,
	);

	return { aaveWithdrawTx };
};

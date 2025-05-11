import addresses from "@/app/constants/adresses.json";
import {
    aaveWithdrawTxBuilder,
} from "./transactionsBuilder";
import type { WithdrawFormValues } from "@/app/components/AaveWithdraw";

export const aaveWithdraw = (values: WithdrawFormValues, accountAddress: string) => {
	const safeAddress = addresses.safeAddress;
	const aavePoolV3Address = addresses.aavePoolV3Address;
	const withdrawTokenAddress = values.withdrawAddress;
	const withdrawTokenDecimals = 18;

	if (!accountAddress) {
		throw new Error("Account not found");
	}

	const withdrawAmount = (
		values.withdrawAmount *
		10 ** withdrawTokenDecimals
	).toString();

	const aaveWithdrawTx = aaveWithdrawTxBuilder(
		aavePoolV3Address,
		withdrawTokenAddress,
		safeAddress,
		withdrawAmount,
	);

	return { aaveWithdrawTx };
};

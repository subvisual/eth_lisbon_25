"use client";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "viem/chains";
import { parseUnits } from "viem";
import { useEffect, useRef } from "react";

// Define the basic ERC20 ABI with just the transfer function
const erc20Abi = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const Transaction = ({
  to,
  value,
  contractAddress,
  decimals,
}: {
  to: string;
  value: string;
  contractAddress: string;
  decimals: number;
}) => {
  const valueBigInt = parseUnits(value, decimals);
  const { writeContract } = useWriteContract();
  const initializedRef = useRef(false);

  const { chain } = useAccount();

  useEffect(() => {
    const initalize = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const params = {
        address: contractAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, valueBigInt],
        chainId: chain.id,
      };

      console.log(
        "%c==>PARAMS",
        "color: green; background: yellow; font-size: 20px",
        params
      );

      const tx = await writeContract(params);
      console.log("tx", tx);
    };

    initalize();
  }, [contractAddress, to, valueBigInt, writeContract]);

  return <div>Transaction Loaded</div>;
};

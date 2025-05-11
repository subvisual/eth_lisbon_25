"use client";

import { Typography } from "antd";
const { Title } = Typography;
import { uiPoolDataProviderAbi } from "../constants/abi/uiPoolDataProvider";
import { erc20Abi } from "../constants/abi/erc20";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { useEffect, useRef } from "react";
import { aaveSupplyBorrowBatch } from "@/lib/aave/aaveSupplyBorrowBatch";
import addresses from "@/app/constants/adresses.json";
import { safeAccountAbi } from "../constants/abi/safeAccount";

const POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";

export interface FormValues {
  supplyAddress: string;
  supplyAmount: number;
  borrowAddress: string;
  borrowAmount: number;
}

const generateUserAddressSignature = (address: string) => {
  return `0x000000000000000000000000${address}000000000000000000000000000000000000000000000000000000000000000001`;
};

export default function Aave({
  assetToSupply,
  assetToBorrow,
  supplyAmount,
  borrowAmount,
}: {
  assetToSupply: string;
  assetToBorrow: string;
  supplyAmount: number;
  borrowAmount: number;
}) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const initializedRef = useRef(false);

  const { data: reservesResult } = useReadContract({
    abi: uiPoolDataProviderAbi,
    address: "0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE",
    functionName: "getReservesData",
    args: [POOL_ADDRESSES_PROVIDER],
  });

  const reserves = reservesResult?.[0];

  const supplyAddress = reserves?.find(
    (r) => r.symbol.toUpperCase() === assetToSupply.toUpperCase()
  )?.underlyingAsset;
  const borrowAddress = reserves?.find(
    (r) => r.symbol.toUpperCase() === assetToBorrow.toUpperCase()
  )?.underlyingAsset;

  useEffect(() => {
    const onSubmit = async () => {
      if (initializedRef.current) return;

      if (!supplyAddress || !borrowAddress || !address) {
        return;
      }
      initializedRef.current = true;

      writeContract({
        abi: erc20Abi,
        address: supplyAddress,
        functionName: "approve",
        args: [addresses.safeAddress, BigInt(supplyAmount * 10 ** 18)],
      });

      const { safeMultiSendData } = aaveSupplyBorrowBatch(
        {
          supplyAddress,
          supplyAmount,
          borrowAddress,
          borrowAmount,
        },
        address
      );

      writeContract({
        abi: safeAccountAbi,
        address: addresses.safeAddress,
        functionName: "execTransaction",
        args: [
          addresses.multiSendAddress,
          BigInt(0),
          safeMultiSendData,
          1,
          BigInt(0),
          BigInt(0),
          BigInt(0),
          addresses.nullAddress,
          addresses.nullAddress,
          generateUserAddressSignature(address),
        ],
      });
    };

    onSubmit();
  }, [
    supplyAddress,
    supplyAmount,
    borrowAddress,
    borrowAmount,
    writeContract,
    address,
    reserves,
  ]);

  return (
    <div>
      <Title level={3}>
        Please confirm the following transaction on your wallet:
      </Title>
      <p>
        Supply {assetToSupply} {supplyAmount}
      </p>
      <p>
        Borrow {assetToBorrow} {borrowAmount}
      </p>
    </div>
  );
}

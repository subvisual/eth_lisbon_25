"use client";

import {
  Layout,
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
} from "antd";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

import { uiPoolDataProviderAbi } from "../constants/abi/uiPoolDataProvider";
import { erc20Abi } from "../constants/abi/erc20";
import { aavePoolV3Abi } from "../constants/abi/aavePoolV3";
import { safeAccountAbi } from "../constants/abi/safeAccount";

import { formatUnits } from "viem";

import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { useState, useEffect } from "react";
import addresses from "@/app/constants/adresses.json";

interface ReserveData {
  underlyingAsset: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  borrowingEnabled: boolean;
  baseLTVasCollateral: bigint;
}

interface ReservesResponse {
  [0]: ReserveData[];
  [1]: any[]; // We don't need the second array for now
}

const POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";

export interface FormValues {
  supplyAddress: string;
  supplyAmount: number;
  borrowAddress: string;
  borrowAmount: number;
}

export default function Aave() {
  const { address, isConnected } = useAccount();

  const { data: userAccountData } = useReadContract({
    abi: aavePoolV3Abi,
    address: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    functionName: "getUserAccountData",
    args: [address!],
  });

  return (
    <Layout style={{ minHeight: "600px", maxHeight: "600px", background: "#fff" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "24px",
          gap: "24px",
        }}
      >
        {isConnected && userAccountData && userAccountData[0] && (
          <Card
            title="Your Aave Position"
            style={{
              maxWidth: 450,
              flex: 1,
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            headStyle={{
              borderBottom: "1px solid #f0f0f0",
              padding: "16px 24px",
            }}
            bodyStyle={{
              padding: "24px",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>Total Collateral (USD)</Text>
                <Text strong style={{ fontSize: "16px" }}>
                  ${formatUnits(userAccountData[0], 8)}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>Total Debt (USD)</Text>
                <Text strong style={{ fontSize: "16px" }}>
                  ${Number(formatUnits(userAccountData[1], 8)).toFixed(2)}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>Available Borrow (USD)</Text>
                <Text strong style={{ fontSize: "16px" }}>
                  ${Number(formatUnits(userAccountData[2], 8)).toFixed(2)}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>
                  Current Liquidation Threshold
                </Text>
                <Text strong style={{ fontSize: "16px" }}>
                  {(Number(userAccountData[3]) / 10000).toFixed(2)}%
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>LTV</Text>
                <Text strong style={{ fontSize: "16px" }}>
                  {(Number(userAccountData[4]) / 10000).toFixed(2)}%
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#8c8c8c" }}>Health Factor</Text>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color:
                      Number(userAccountData[5]) > 1 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {Number(formatUnits(userAccountData[5], 18)).toFixed(2)}
                </Text>
              </div>
            </Space>
          </Card>
        )}
      </Content>
    </Layout>
  );
}

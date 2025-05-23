"use client";

import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
} from "antd";

const { Content } = Layout;
const { Option } = Select;

import { uiPoolDataProviderAbi } from "../constants/abi/uiPoolDataProvider";
import { erc20Abi } from "../constants/abi/erc20";

import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { useState, useEffect } from "react";
import addresses from "@/app/constants/adresses.json";
import { safeAccountAbi } from "../constants/abi/safeAccount";
import { aaveBorrow } from "@/lib/aave/aaveBorrow";
import { useSafe } from "@/lib/providers";
import { userAddressSignature } from "@/lib/aave/transactionsBuilder";

const POOL_ADDRESSES_PROVIDER = "0x36616cf17557639614c1cdDb356b1B83fc0B2132";

export interface BorrowFormValues {
  borrowAddress: string;
  borrowAmount: number;
}

export interface ReserveData {
  underlyingAsset: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
}

export default function AaveBorrow() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const [tokenBalances, setTokenBalances] = useState<{
    [address: string]: bigint;
  }>({});

  const { selectedSafe } = useSafe();

  const { data: reserves } = useReadContract({
    abi: uiPoolDataProviderAbi,
    address: "0x5598BbFA2f4fE8151f45bBA0a3edE1b54B51a0a9",
    functionName: "getReservesData",
    args: [POOL_ADDRESSES_PROVIDER],
  });

  const [selectedToken, setSelectedToken] = useState<string>("");
  
  const { data: borrowDecimals } = useReadContract({
    abi: erc20Abi,
    address: selectedToken,
    functionName: "decimals",
    args: [],
    enabled: !!selectedToken,
  });

  useEffect(() => {
    const fetchBalances = async () => {
      if (!reserves || !address || !publicClient) return;

      const balances: { [tokenAddress: string]: bigint } = {};

      const tokenAddresses = reserves[0].map((r) => r.underlyingAsset);

      await Promise.all(
        tokenAddresses.map(async (tokenAddr: string) => {
          try {
            const balance = await publicClient.readContract({
              abi: erc20Abi,
              address: tokenAddr,
              functionName: "balanceOf",
              args: [address],
            });

            balances[tokenAddr] = balance as bigint;
          } catch (err) {
            console.error(`Failed to fetch balance for ${tokenAddr}`, err);
          }
        })
      );

      setTokenBalances(balances);
    };

    fetchBalances();
  }, [reserves, address, publicClient]);

  const [form] = Form.useForm();

  const onSubmit = async (values: BorrowFormValues) => {
    if (!address || !selectedSafe || !borrowDecimals) {
      throw new Error("Account not connected or token decimals not available");
    }

    const { aaveBorrowTx } = aaveBorrow(values, address, selectedSafe, Number(borrowDecimals));

    writeContract({
        abi: safeAccountAbi,
        address: selectedSafe,
        functionName: "execTransaction",
        args: [
            addresses.aavePoolV3Address,
            BigInt(0),
            aaveBorrowTx.data,
            0,
            BigInt(0),
            BigInt(0),
            BigInt(0),
            addresses.nullAddress,
            addresses.nullAddress,
            userAddressSignature(address),
        ],
    });
  };

  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
  };

  return (
    <Layout style={{ minHeight: "600px", background: "#ffff" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card style={{ maxWidth: 450, flex: 1 }}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onSubmit}
            initialValues={{
              borrowAmount: 0,
              borrowAsset: "USDC",
            }}
          >
            <Form.Item label="Asset to Borrow" name="borrowAddress">
              <Select 
                placeholder="Select asset" 
                optionLabelProp="label"
                onChange={handleTokenChange}
              >
                {reserves?.[0]
                  ?.filter((token: ReserveData) => token.isActive)
                  .map((token: ReserveData) => (
                      <Option
                        key={token.underlyingAsset}
                        value={token.underlyingAsset}
                        label={token.symbol}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{token.symbol}</span>
                        </div>
                      </Option>
                    ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Amount to Borrow"
              name="borrowAmount"
              rules={[
                {
                  required: true,
                  message: "Please input the amount to Borrow",
                },
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Space>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={!isConnected}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}

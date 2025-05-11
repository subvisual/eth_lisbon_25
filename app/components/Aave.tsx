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
import { aaveSupplyBorrowBatch } from "@/lib/aave/aaveSupplyBorrowBatch";
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
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const [tokenBalances, setTokenBalances] = useState<{
    [address: string]: bigint;
  }>({});
  const [selectedSupplyToken, setSelectedSupplyToken] =
    useState<ReserveData | null>(null);

  const { data: reserves } = useReadContract({
    abi: uiPoolDataProviderAbi,
    address: "0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE",
    functionName: "getReservesData",
    args: [POOL_ADDRESSES_PROVIDER],
  }) as { data: ReservesResponse | undefined };

  const { data: userAccountData } = useReadContract({
    abi: aavePoolV3Abi,
    address: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    functionName: "getUserAccountData",
    args: [address!],
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

  const getAvailableAmount = (tokenAddress: string, decimals: number) => {
    const bal = tokenBalances[tokenAddress];
    if (bal === undefined) return 0;
    return formatUnits(bal, Number(decimals));
  };

  const onSubmit = async (values: FormValues) => {
    if (!address) {
      throw new Error("Account not connected");
    }

    writeContract({
      abi: erc20Abi,
      address: values.supplyAddress,
      functionName: "approve",
      args: [addresses.safeAddress, BigInt(values.supplyAmount * 10 ** 18)],
    });

    const { safeMultiSendData } = aaveSupplyBorrowBatch(values, address);

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
        addresses.userAddressSignature,
      ],
    });
  };

  return (
    <Layout style={{ minHeight: "600px", background: "#fff" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "24px",
          gap: "24px",
        }}
      >
        <Card style={{ maxWidth: 450, flex: 1 }}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onSubmit}
            initialValues={{
              lendAmount: 0,
              borrowAmount: 0,
              lendAsset: "WETH",
            }}
          >
            <Title level={5}>Supply</Title>

            <Form.Item
              label="Asset to Supply"
              name="supplyAddress"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select asset"
                optionLabelProp="label"
                onChange={(value: string) => {
                  const token = reserves?.[0]?.find(
                    (t: ReserveData) => t.underlyingAsset === value
                  );
                  setSelectedSupplyToken(token || null);
                  form.setFieldValue("supplyAddress", value);
                }}
                style={{ width: "100%" }}
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
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{token.symbol}</span>
                        <span style={{ color: "#8c8c8c" }}>
                          {getAvailableAmount(
                            token.underlyingAsset,
                            token.decimals
                          )}
                        </span>
                      </div>
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Amount to Supply"
              name="supplyAmount"
              rules={[
                {
                  required: true,
                  message: "Please input the amount to supply",
                },
                {
                  validator: (_, value) => {
                    const selectedToken = form.getFieldValue("supplyAddress");
                    if (selectedToken && value) {
                      const token = reserves?.[0]?.find(
                        (t: ReserveData) => t.underlyingAsset === selectedToken
                      );

                      if (token) {
                        const maxAmount = getAvailableAmount(
                          token.underlyingAsset,
                          token.decimals
                        );
                        if (value > maxAmount) {
                          return Promise.reject(
                            new Error(
                              `Amount exceeds available balance of ${maxAmount}`
                            )
                          );
                        }
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Max:{" "}
                  {selectedSupplyToken
                    ? getAvailableAmount(
                        selectedSupplyToken.underlyingAsset,
                        selectedSupplyToken.decimals
                      )
                    : 0}
                </Text>
              </Space>
            </Form.Item>

            <div style={{ marginBottom: "32px" }}>
              <Title
                level={5}
                style={{ marginBottom: "16px", color: "#1a1a1a" }}
              >
                Borrow
              </Title>

              <Form.Item
                label="Asset to Borrow"
                name="borrowAddress"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select asset" style={{ width: "100%" }}>
                  {reserves?.[0]
                    ?.filter(
                      (token: ReserveData) =>
                        token.isActive && token.borrowingEnabled
                    )
                    .map((token: ReserveData) => (
                      <Option
                        key={token.underlyingAsset}
                        value={token.underlyingAsset}
                      >
                        {token.symbol}
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
                    message: "Please input the amount to borrow",
                  },
                ]}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <InputNumber min={0} style={{ width: "100%" }} size="large" />
                </Space>
              </Form.Item>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                disabled={
                  !isConnected ||
                  form.getFieldsError().some(({ errors }) => errors.length)
                }
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
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

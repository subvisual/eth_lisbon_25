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

import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { useState, useEffect } from "react";
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

export default function Aave() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const [tokenBalances, setTokenBalances] = useState<{
    [address: string]: bigint;
  }>({});

  const { data: reserves } = useReadContract({
    abi: uiPoolDataProviderAbi,
    address: "0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE",
    functionName: "getReservesData",
    args: [POOL_ADDRESSES_PROVIDER],
  });

  // const { data: userReserves } = useReadContract({
  //   abi: uiPoolDataProviderAbi,
  //   address: "0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE",
  //   functionName: "getUserReservesData",
  //   args: [POOL_ADDRESSES_PROVIDER, address],
  // });

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
    if (!bal) return "0";
    return (Number(bal) / 10 ** decimals).toFixed(4);
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
    <Layout style={{ minHeight: "600px", background: "#fafafa" }}>
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
              lendAmount: 0,
              borrowAmount: 0,
              lendAsset: "WETH",
            }}
          >
            <Title level={5}>Supply</Title>

            <Form.Item label="Asset to Supply" name="supplyAddress">
              <Select placeholder="Select asset" optionLabelProp="label">
                {reserves &&
                  reserves[0]
                    .filter((token) => token.isActive)
                    .map((token) => (
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
                          {/* <span style={{ color: "#888" }}>
                            {getAvailableAmount(
                              token.underlyingAsset,
                              token.decimals
                            )}
                          </span> */}
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
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Space>
            </Form.Item>

            <Title level={5}>Borrow</Title>

            <Form.Item label="Asset to Borrow" name="borrowAddress">
              <Select placeholder="Select asset">
                {reserves &&
                  reserves[0]
                    .filter((token) => token.isActive && token.borrowingEnabled)
                    .map((token) => (
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
              <InputNumber min={0} style={{ width: "100%" }} />
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

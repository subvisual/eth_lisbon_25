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

import { aavePoolV3Abi } from "../constants/abi/aavePoolV3";
import { uiPoolDataProviderAbi } from "../constants/abi/uiPoolDataProvider";
import { walletBalanceProviderAbi } from "../constants/abi/walletBalanceProviderAbi";
import { erc20Abi } from "../constants/abi/erc20";

import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { useState, useEffect } from "react";

const POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";

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

      console.log(reserves);
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

            console.log(tokenAddr, balance);

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
    return (Number(bal) / Math.pow(10, decimals)).toFixed(4);
  };

  const onSubmit = async (values: any) => {
    console.log("reservesList2", reserves);
    console.log("userBalances2", tokenBalances);

    writeContract({
      abi: aavePoolV3Abi,
      address: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
      functionName: "supply",
      args: [
        "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
        BigInt(10),
        "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
        0,
      ],
    });
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Header
        style={{
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px 24px",
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
          }}
        >
          Aave V3 on Gnosis Chain
        </Title>
      </Header>

      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card title="Supply & Borrow" style={{ maxWidth: 450, flex: 1 }}>
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

            <Form.Item label="Asset to Supply" name="lendAsset">
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
                          <span style={{ color: "#888" }}>
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
              name="lendAmount"
              rules={[
                {
                  required: true,
                  message: "Please input the amount to lend",
                },
              ]}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Space>
            </Form.Item>

            <Title level={5}>Borrow</Title>

            <Form.Item label="Asset to Borrow" name="borrowAsset">
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

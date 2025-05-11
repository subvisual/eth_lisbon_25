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
  import { aaveRepay } from "@/lib/aave/aaveRepay";

  const POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";

  export interface RepayFormValues {
    repayAddress: string;
    repayAmount: number;
  }

  export interface ReserveData {
    underlyingAsset: string;
    symbol: string;
    decimals: number;
    isActive: boolean;
  }

  export default function AaveRepay() {
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

    const onSubmit = async (values: RepayFormValues) => {
      if (!address) {
          throw new Error("Account not connected");
      }

      const { safeMultiSendData } = aaveRepay(values, address);

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
                repayAmount: 0,
                repayAsset: "USDT",
              }}
            >
              <Form.Item label="Asset to Repay" name="repayAddress">
                <Select placeholder="Select asset" optionLabelProp="label">
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
                label="Amount to repay"
                name="repayAmount"
                rules={[
                  {
                    required: true,
                    message: "Please input the amount to Repay",
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

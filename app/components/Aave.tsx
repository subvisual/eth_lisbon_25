"use client";

import {
  Layout,
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  Card,
} from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { getContract } from "viem";
import { aavePoolV3Abi } from "../constants/abi/aavePoolV3";
import { erc20Abi } from "../constants/abi/erc20";

export default function Aave() {
  const { primaryWallet } = useDynamicContext();

  const [form] = Form.useForm();

  const onSubmit = async (values: any) => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const walletClient = await primaryWallet.getWalletClient();

    const pool = getContract({
      address: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
      abi: aavePoolV3Abi,
      client: walletClient,
    });

    const reserveAddresses = await pool.read.getReservesList();

    const reserves = await Promise.all(
      reserveAddresses.map(async (tokenAddress) => {
        try {
          const tokenContract = getContract({
            address: tokenAddress,
            abi: erc20Abi,
            client: walletClient,
          });

          const symbol = await tokenContract.read.symbol();

          return {
            tokenAddress,
            symbol,
            reserveData: await pool.read.getReserveData([tokenAddress]),
          };
        } catch (err) {
          console.error(`Error loading data for ${tokenAddress}`, err);
          return null;
        }
      })
    );

    console.log(reserves);
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
              lendAsset: "wstETH",
              borrowAsset: "EURe",
            }}
          >
            <Title level={5}>Supply</Title>

            <Form.Item label="Asset to Supply" name="lendAsset">
              <Select placeholder="Select asset">
                <Option value="ETH">wstETH</Option>
                <Option value="USDC">USDC.e</Option>
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
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Title level={5}>Borrow</Title>

            <Form.Item label="Asset to Borrow" name="borrowAsset">
              <Select placeholder="Select asset">
                <Option value="EURe">EURe</Option>
                <Option value="USDC">USDC.e</Option>
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
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}

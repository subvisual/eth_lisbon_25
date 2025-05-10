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

import { aavePoolV3Abi } from "../constants/abi/aavePoolV3";
import { erc20Abi } from "../constants/abi/erc20";

import {
  useAccount,
  useWriteContract,
  useWalletClient,
  useReadContract,
} from "wagmi";

export default function Aave() {
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient();

  const { writeContract } = useWriteContract();

  const { data: reservesList } = useReadContract({
    abi: aavePoolV3Abi,
    address: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    functionName: "getReservesList",
  });

  console.log("here", reservesList);

  const [form] = Form.useForm();

  const onSubmit = async (values: any) => {
    const result = writeContract({
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

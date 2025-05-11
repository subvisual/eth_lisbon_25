"use client";

import Aave from "@/app/components/Aave";
import AaveRepay from "@/app/components/AaveRepay";
import AaveSupply from "@/app/components/AaveSupply";
import AaveBorrow from "@/app/components/AaveBorrow";
import AaveWithdraw from "@/app/components/AaveWithdraw";
import { Layout, Tabs } from "antd";
import { Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import AavePosition from "../components/AavePosition";

const { Content, Sider } = Layout;

export default function AavePage() {
  const items = [
    {
      key: "supply-borrow",
      label: "Supply & Borrow",
      children: <Aave />,
    },
    {
      key: "supply",
      label: "Supply",
      children: <AaveSupply />,
    },
    {
      key: "borrow",
      label: "Borrow",
      children: <AaveBorrow />,
    },
    {
      key: "repay",
      label: "Repay",
      children: <AaveRepay />,
    },
    {
      key: "withdraw",
      label: "Withdraw",
      children: <AaveWithdraw />,
    },
  ];

  return (
    <Layout style={{ minHeight: "600px" }}>
      <Title level={2} style={{ marginBottom: 16, padding: "24px 24px 0" }}>
        Aave Integration
      </Title>
      <Layout>
        <Content style={{ padding: "0 24px" }}>
          <Tabs
            defaultActiveKey="supply-borrow"
            items={items}
            style={{
              padding: "24px",
              background: "#fff",
              marginTop: "40px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        </Content>
        <Sider
          width={400}
          style={{
            background: "#fff",
            padding: "24px",
            margin: "40px 24px 24px 0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <AavePosition />
        </Sider>
      </Layout>
    </Layout>
  );
}

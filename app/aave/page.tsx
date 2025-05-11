"use client";

import Aave from "@/app/components/Aave";
import AaveRepay from "@/app/components/AaveRepay";
import AaveSupply from "@/app/components/AaveSupply";
import AaveBorrow from "@/app/components/AaveBorrow";
import AaveWithdraw from "@/app/components/AaveWithdraw";
import { Layout, Tabs } from "antd";
import { Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";

export default function AavePage() {
  const items = [
    {
      key: 'supply-borrow',
      label: 'Supply & Borrow',
      children: <Aave />,
    },
    {
      key: 'supply',
      label: 'Supply',
      children: <AaveSupply />,
    },
    {
      key: 'borrow',
      label: 'Borrow',
      children: <AaveBorrow />,
    },
    {
      key: 'repay',
      label: 'Repay',
      children: <AaveRepay />,
    },
    {
      key: 'withdraw',
      label: 'Withdraw',
      children: <AaveWithdraw />,
    },
  ];

  return (
    <Layout>
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
          Aave V3 Dashboard
        </Title>
      </Header>
      <Tabs
        defaultActiveKey="supply-borrow"
        items={items}
        style={{ 
          padding: '24px',
          background: '#fff',
          margin: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </Layout>
  );
}

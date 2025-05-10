"use client";
import { LiFiWidget } from "@lifi/widget";
import { WidgetConfig, ChainType } from "@lifi/widget";
import { useAccount } from "wagmi";
import { useSafe } from "@/lib/providers";
import { Card, Flex, Typography } from "antd";

const { Title } = Typography;

export default function BridgeAndSwapWidget() {
  const { selectedSafe } = useSafe();

  const widgetConfig: WidgetConfig = {
    integrator: "your-app-name",
    appearance: "light",
    hiddenUI: ["poweredBy"],
    variant: "compact",
    toToken: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
    toChain: 100,
    toAddress: {
      address: selectedSafe || "",
      chainType: ChainType.EVM,
    },
    tokens: {
      featured: [
        {
          address: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
          symbol: "USDC",
          name: "USDC",
          decimals: 6,
          chainId: 100,
        },
        {
          address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
          symbol: "EURe",
          name: "EURe",
          decimals: 18,
          chainId: 100,
        },
        {
          address: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
          symbol: "EURe",
          name: "EURe",
          decimals: 18,
          chainId: 100,
        },
      ],
    },
    theme: {
      palette: {
        primary: {
          main: "#1890ff",
        },
        secondary: {
          main: "#52c41a",
        },
        background: {
          paper: "#ffffff",
        },
      },
      container: {
        borderRadius: "8px",
      },
      shape: {
        borderRadius: 12,
      },
      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },
  };

  return (
    <Flex
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex>
        <Title level={2} style={{ marginBottom: 16 }}>
          Bridge & Swap
        </Title>
      </Flex>
      <Flex
        vertical
        style={{
          alignItems: "center",
          flexGrow: 1,
          borderRadius: "12px",
          paddingTop: 16,
        }}
      >
        <Card
          style={{
            width: "100%",
            height: "100%",
            padding: "24px",
            background: "#fff",
            margin: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <LiFiWidget config={widgetConfig} integrator="your-app-name" />
        </Card>
      </Flex>
    </Flex>
  );
}

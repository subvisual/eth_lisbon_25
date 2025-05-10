"use client";
import { LiFiWidget } from "@lifi/widget";
import { WidgetConfig, ChainType } from "@lifi/widget";
import { useAccount } from "wagmi";
import { useSafe } from "@/lib/providers";

export default function BridgeAndSwapWidget() {
  const { address } = useAccount();
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
          default: "#f5f5f5",
        },
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
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-xl p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bridge & Swap</h2>
        <div className="flex-1" style={{ border: "1px solid #e8e8e8", borderRadius: "12px" }}>
          <LiFiWidget config={widgetConfig} integrator="your-app-name" />
        </div>
      </div>
    </div>
  );
}

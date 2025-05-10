"use client";
import { LiFiWidget } from "@lifi/widget";
import { WidgetConfig, ChainType } from "@lifi/widget";
import { useAccount } from "wagmi";

export default function BridgeAndSwapWidget() {
  const { address } = useAccount();

  const widgetConfig: WidgetConfig = {
    integrator: "your-app-name",
    appearance: "light",
    toToken: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
    toChain: 100,
    toAddress: {
      address: "0xbeef" || "", // TODO: safe address ,
      chainType: ChainType.EVM,
    },
    tokens: {
      // Featured tokens will appear on top of the list
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
  };

  return (
    <div className="p-4">
      <LiFiWidget config={widgetConfig} integrator="your-app-name" />
    </div>
  );
}

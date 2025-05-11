import { http, createConfig } from "wagmi";
import { sepolia, base, gnosis } from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, base, gnosis],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
    [gnosis.id]: http(),
  },
  ssr: true,
});

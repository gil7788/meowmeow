import { defineChain } from "viem";

export const zircuitTestnet = defineChain({
  id: 48898,
  name: "Zircuit Garfield Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://zircuit-garfield-testnet.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zircuit Explorer",
      url: "https://explorer.garfield-testnet.zircuit.com",
    },
  },
  testnet: true,
});

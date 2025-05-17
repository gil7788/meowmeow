import { Chain, defineChain } from "viem";

export const zircuitGarfieldTestnet: Chain = {
  id: 48898,
  name: "Zircuit Garfield Testnet",
  nativeCurrency: {
    name: "Garfield ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://zircuit-garfield-testnet.drpc.org"],
    },
    public: {
      http: ["https://zircuit-garfield-testnet.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zircuit Garfield Explorer",
      url: "https://explorer.garfield-testnet.zircuit.com",
    },
  },
  testnet: true,
};

export const zircuitMainnet = defineChain({
  id: 48900,
  name: "Zircuit Mainnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://zircuit-mainnet.drpc.org/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zircuit Explorer",
      url: "https://explorer.zircuit.com/",
    },
  },
});

export const customChainMap = {
  local: {
    id: 31337,
    chain: defineChain({
      id: 31337,
      name: "Foundry",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: ["http://127.0.0.1:8545"],
          webSocket: ["ws://127.0.0.1:8545"],
        },
      },
    }),
  },
  localnet: {
    id: 31337,
    chain: defineChain({
      id: 31337,
      name: "Foundry",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: ["http://127.0.0.1:8545"],
          webSocket: ["ws://127.0.0.1:8545"],
        },
      },
    }),
  },
  test: {
    id: zircuitGarfieldTestnet.id,
    chain: zircuitGarfieldTestnet,
  },
  testnet: {
    id: zircuitGarfieldTestnet.id,
    chain: zircuitGarfieldTestnet,
  },
  main: {
    id: zircuitMainnet.id,
    chain: zircuitMainnet,
  },
  mainnet: {
    id: zircuitMainnet.id,
    chain: zircuitMainnet,
  },
};

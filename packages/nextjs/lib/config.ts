export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  chainId: number;
  currencySymbol: string;
  blockExplorerUrl: string;
}

export type Environment = "local" | "test" | "main" | "localnet" | "testnet" | "mainnet";

const local: NetworkConfig = {
  name: "Localhost",
  rpcUrl: "http://127.0.0.1:8545",
  wsUrl: "ws://127.0.0.1:8545",
  chainId: 31337,
  currencySymbol: "ETH",
  blockExplorerUrl: "http://localhost:8545",
};

const test: NetworkConfig = {
  name: "Zircuit Garfield Testnet",
  rpcUrl: "https://garfield-testnet.zircuit.com/",
  wsUrl: "wss://garfield-ws.zircuit.com/",
  chainId: 48898,
  currencySymbol: "ETH",
  blockExplorerUrl: "https://explorer.garfield-testnet.zircuit.com/",
};

const main: NetworkConfig = {
  name: "Zircuit Mainnet",
  rpcUrl: "https://zircuit-mainnet.drpc.org/",
  wsUrl: "wss://zircuit-mainnet-ws.drpc.org/",
  chainId: 48900,
  currencySymbol: "ETH",
  blockExplorerUrl: "https://explorer.zircuit.com/",
};

export const NetworkConfigs: Record<Environment, NetworkConfig> = {
  local,
  localnet: local,
  test,
  testnet: test,
  main,
  mainnet: main,
};

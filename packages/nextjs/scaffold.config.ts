import * as chains from "viem/chains";
import { env } from "~~/env";
import { zircuitTestnet } from "~~/utils/customChains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<string, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

let selectedChain;
if (env.networkEnv === "main" || env.networkEnv === "mainnet") {
  selectedChain = chains.zircuit;
} else if (env.networkEnv === "test" || env.networkEnv === "testnet") {
  selectedChain = zircuitTestnet;
} else {
  selectedChain = chains.foundry;
  if (env.networkEnv !== "local" && env.networkEnv !== "localnet") {
    console.warn(`⚠️ No chain config found for "${env.networkEnv}", falling back to Foundry (31337)`);
  }
}

const rpcUrl = selectedChain.rpcUrls?.default?.http?.[0];
if (!rpcUrl) {
  throw new Error(`❌ No RPC URL found for selected chain ID ${selectedChain.id}`);
}

const rpcOverrides: Record<string, string> = {
  [selectedChain.id.toString()]: rpcUrl,
};

console.log("SelectedChain:", selectedChain);

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [selectedChain],
  // targetNetworks: [chains.foundry],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides,

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: env.networkEnv === "local" || env.networkEnv === "localnet",
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;

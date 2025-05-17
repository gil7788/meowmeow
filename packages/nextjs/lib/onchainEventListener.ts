import { parseBuyLog, parseTokenCreatedLog } from "./onchainEventParser";
import { BuyEvent, TokenCreatedEvent } from "@/lib/types";
import { ethers } from "ethers";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const targetChain = scaffoldConfig.targetNetworks[0];
const chainId = targetChain.id;
const chainIdStr = String(chainId);

if (!(chainIdStr in deployedContracts)) {
  throw new Error(`❌ Chain ID ${chainIdStr} not found in deployedContracts`);
}

const { LaunchPad } = (deployedContracts as Record<string, any>)[chainIdStr];
const LAUNCHPAD_ADDRESS = LaunchPad?.address;
const LAUNCHPAD_ABI = LaunchPad?.abi;

if (!LAUNCHPAD_ADDRESS || !LAUNCHPAD_ABI) {
  throw new Error(`❌ Missing LaunchPad details for chain ID ${chainIdStr}`);
}

function getRpcUrl(): string {
  const targetChain = scaffoldConfig.targetNetworks[0];
  const override = scaffoldConfig.rpcOverrides?.[targetChain.id];
  const fallback = targetChain.rpcUrls?.default?.http?.[0];

  if (override) return override;
  if (fallback) return fallback;

  throw new Error(`❌ No RPC URL found for chainId ${targetChain.id}`);
}

function getHttpProvider(): ethers.JsonRpcProvider {
  const rpcUrl = getRpcUrl();
  console.log(`🔗 Using RPC URL: ${rpcUrl}`);
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getAllRecentTokenCreatedEvents(
  searchInterval: number,
  maxEvents: number,
): Promise<TokenCreatedEvent[]> {
  const provider = getHttpProvider();
  const iface = new ethers.Interface(LAUNCHPAD_ABI);
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - searchInterval, 0);

  const logs = await provider.getLogs({
    address: LAUNCHPAD_ADDRESS,
    topics: [ethers.id("TokenCreated(address,address,string,string,string,string)")],
    fromBlock,
    toBlock: "latest",
  });

  return logs
    .reverse()
    .map(log => parseTokenCreatedLog(log, iface))
    .filter((event): event is TokenCreatedEvent => event !== null)
    .slice(0, maxEvents);
}

export async function getAllRecentBuyEvents(searchInterval: number, maxEvents: number): Promise<BuyEvent[]> {
  const provider = getHttpProvider();
  const iface = new ethers.Interface(LAUNCHPAD_ABI);
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - searchInterval, 0);

  const logs = await provider.getLogs({
    address: LAUNCHPAD_ADDRESS,
    topics: [ethers.id("Buy(address,uint256,uint256,uint256)")],
    fromBlock,
    toBlock: "latest",
  });

  return logs
    .reverse()
    .map(log => parseBuyLog(log, iface))
    .filter((event): event is BuyEvent => event !== null)
    .slice(0, maxEvents);
}

export function listenToTokenCreated(onEvent: (event: TokenCreatedEvent) => void): () => void {
  const provider = getHttpProvider();
  const contract = new ethers.Contract(LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI, provider);

  const handler = (
    creator: string,
    tokenAddress: string,
    name: string,
    symbol: string,
    description: string,
    image: string,
  ) => {
    try {
      if (!ethers.isAddress(tokenAddress)) return;
      const event = new TokenCreatedEvent(creator, tokenAddress, name, symbol, description, image);
      onEvent(event);
    } catch (e) {
      console.error("Failed to parse TokenCreated event:", e);
    }
  };

  contract.on("TokenCreated", handler);
  return () => contract.off("TokenCreated", handler);
}

export function listenToBuyEvent(onEvent: (event: BuyEvent) => void): () => void {
  const provider = getHttpProvider();
  const contract = new ethers.Contract(LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI, provider);

  const handler = (
    buyer: string,
    amount: ethers.BigNumberish,
    price: ethers.BigNumberish,
    tokenTotalSupply: ethers.BigNumberish,
  ) => {
    try {
      const event = new BuyEvent(buyer, BigInt(amount), BigInt(price), BigInt(tokenTotalSupply));
      onEvent(event);
    } catch (e) {
      console.error("Failed to parse Buy event:", e);
    }
  };

  contract.on("Buy", handler);
  return () => contract.off("Buy", handler);
}

export async function publicFetch(
  publicClient: ReturnType<typeof usePublicClient>,
  contractAddress: string,
  functionName: string,
  tokenAbi: any,
  args: any[] = [],
): Promise<any> {
  try {
    if (publicClient == undefined) {
      console.error(`Public client is undefined`);
    }
    const result = await publicClient!.readContract({
      address: contractAddress as `0x${string}`,
      abi: tokenAbi,
      functionName: functionName,
      args: args,
    });
    return result;
  } catch (e) {
    console.error(`Failed to fetch ${functionName} from ${contractAddress}:`, e);
  }
}

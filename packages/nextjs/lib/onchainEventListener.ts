import { parseBuyLog, parseTokenCreatedLog } from "./onchainEventParser";
import { BuyEvent, TokenCreatedEvent } from "@/lib/types";
import { ethers } from "ethers";
import { getAddress } from "ethers";

const FACTORY_ADDRESS = getAddress(process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS!);

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: "localhost",
    chainId: 31337,
  });
}

export async function getAllRecentTokenCreatedEvents(
  searchInterval: number,
  maxEvents: number,
): Promise<TokenCreatedEvent[]> {
  const provider = createProvider();
  const iface = new ethers.Interface(TokenCreatedEvent.abi);
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - searchInterval, 0);

  const logs = await provider.getLogs({
    address: FACTORY_ADDRESS,
    topics: [TokenCreatedEvent.topic],
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
  const provider = createProvider();
  const iface = new ethers.Interface(BuyEvent.abi);
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - searchInterval, 0);

  const logs = await provider.getLogs({
    address: FACTORY_ADDRESS,
    topics: [BuyEvent.topic],
    fromBlock,
    toBlock: "latest",
  });

  return logs
    .reverse()
    .map(log => parseBuyLog(log, iface))
    .filter((event): event is BuyEvent => event !== null)
    .slice(0, maxEvents);
}

export function listenToTokenCreated(onEvent: (event: TokenCreatedEvent) => void) {
  const provider = createProvider();
  const contract = new ethers.Contract(FACTORY_ADDRESS, TokenCreatedEvent.abi, provider);

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

export function listenToBuyEvent(onEvent: (event: BuyEvent) => void) {
  const provider = createProvider();
  const contract = new ethers.Contract(FACTORY_ADDRESS, BuyEvent.abi, provider);

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

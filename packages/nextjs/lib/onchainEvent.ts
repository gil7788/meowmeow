import { parseTokenCreatedLog } from "./onchainEventParser";
import { TokenCreatedEvent } from "@/lib/types";
import { ethers } from "ethers";
import { getAddress } from "ethers";

// ✅ Use checksummed address to avoid invalid address errors
const FACTORY_ADDRESS = getAddress(process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS!);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: "localhost", // avoids ENS resolution attempt
    chainId: 31337,
  });
}

export async function getAllRecentEvents(searchInterval: number, maxEvents: number): Promise<TokenCreatedEvent[]> {
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

export function listenToEvent(onEvent: (parsed: TokenCreatedEvent) => void) {
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
      if (!ethers.isAddress(tokenAddress)) {
        console.warn("Received invalid tokenAddress from event:", tokenAddress);
        return;
      }

      const event = new TokenCreatedEvent(creator, tokenAddress, name, symbol, description, image);
      onEvent(event);
    } catch (e) {
      console.error("Failed to parse TokenCreated event:", e);
    }
  };

  contract.on("TokenCreated", handler);
  return () => contract.off("TokenCreated", handler);
}

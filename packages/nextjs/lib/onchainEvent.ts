import { TokenCreatedEvent } from "@/lib/types";
import { ethers } from "ethers";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

export async function getAllRecentEvents(searchInterval: number, maxEvents: number): Promise<TokenCreatedEvent[]> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const iface = new ethers.Interface(TokenCreatedEvent.abi);
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - searchInterval, 0);

  let topic: string;
  try {
    const event = TokenCreatedEvent.abi;
    if (!event) throw new Error(`Event ${TokenCreatedEvent.abi[0].name} not found in ABI`);

    topic = TokenCreatedEvent.topic;
  } catch (e) {
    console.error("Failed to get event topic:", e);
    return [];
  }

  const logs = await provider.getLogs({
    address: FACTORY_ADDRESS,
    topics: [topic],
    fromBlock,
    toBlock: "latest",
  });

  const events = logs
    .reverse()
    .map(log => {
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) return null;
        return parseEvent(parsed.args);
      } catch (e) {
        console.warn("Failed to parse log:", e);
        return null;
      }
    })
    .filter((event): event is TokenCreatedEvent => event !== null)
    .slice(0, maxEvents);

  return events;
}

export function listenToEvent(onEvent: (parsed: TokenCreatedEvent) => void) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(FACTORY_ADDRESS, TokenCreatedEvent.abi, provider);

  const handler = (...args: any[]) => {
    try {
      const parsed = parseEvent(args);
      onEvent(parsed);
    } catch (e) {
      console.error(`Failed to parse ${TokenCreatedEvent.abi[0].name} event`, e);
    }
  };

  contract.on(TokenCreatedEvent.abi[0].name, handler);

  return () => {
    contract.off(TokenCreatedEvent.abi[0].name, handler);
  };
}

function parseEvent(args: any): TokenCreatedEvent {
  const [creator, tokenAddress, name, symbol, description, image] = args;
  const event = new TokenCreatedEvent(creator, tokenAddress, name, symbol, description, image);
  console.debug(`✅ New Token Captured!, ${name}`);
  return event;
}

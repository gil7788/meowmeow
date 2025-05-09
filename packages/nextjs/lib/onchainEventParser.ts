import { TokenCreatedEvent } from "@/lib/types";
import { ethers } from "ethers";
import { getAddress } from "viem";

export function parseTokenCreatedLog(log: any, iface: ethers.Interface): TokenCreatedEvent | null {
  try {
    const parsed = iface.parseLog(log);
    if (!parsed) return null;

    const { creator, tokenAddress, name, symbol, description, image } = parsed.args as Record<string, string>;

    if (!ethers.isAddress(tokenAddress)) {
      console.warn("Invalid tokenAddress in log:", tokenAddress);
      return null;
    }

    return new TokenCreatedEvent(creator, getAddress(tokenAddress), name, symbol, description, image);
  } catch (e) {
    console.warn("Failed to parse log:", e);
    return null;
  }
}

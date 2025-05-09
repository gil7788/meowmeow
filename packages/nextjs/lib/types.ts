import { id as keccak256, toUtf8Bytes } from "ethers";
import { ethers } from "ethers";

export class TokenCreatedEvent {
  creator: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  keccak256Hash: string;
  timestamp: number;
  progress?: number;

  constructor(
    creator: string,
    tokenAddress: string,
    name: string,
    symbol: string,
    description: string,
    image?: string, // base64
  ) {
    this.creator = creator;
    this.tokenAddress = tokenAddress;
    this.name = name;
    this.symbol = symbol;
    this.description = description;
    this.image = image ?? "none";
    this.timestamp = Date.now();
    this.progress = this.deterministicProgress();
    const dataToHash = `${creator}:${tokenAddress}:${name}:${symbol}:${description}:${this.image}`;
    this.keccak256Hash = keccak256(`0x${Buffer.from(toUtf8Bytes(dataToHash)).toString("hex")}`);
  }

  static readonly topic = ethers.id("TokenCreated(address,address,string,string,string,string)");

  static readonly abi = [
    {
      type: "event",
      name: "TokenCreated",
      inputs: [
        { name: "creator", type: "address", indexed: true },
        { name: "tokenAddress", type: "address", indexed: false },
        { name: "name", type: "string", indexed: false },
        { name: "symbol", type: "string", indexed: false },
        { name: "description", type: "string", indexed: false },
        { name: "image", type: "string", indexed: false },
      ],
      anonymous: false,
    },
  ] as const;

  private deterministicProgress(): number {
    const hash = [...this.tokenAddress].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 100;
  }
}

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  raised: string;
  goal: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: string;
  tokenSymbol: string;
  tokenPrice: string;
  totalSupply: string;
  features: string[];
  tokenAllocation: { name: string; percentage: number }[];
  audit: string;
};

import { getAddress, id as keccak256, toUtf8Bytes } from "ethers";
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
    this.creator = getAddress(creator);
    this.tokenAddress = getAddress(tokenAddress);
    this.name = name;
    this.symbol = symbol;
    this.description = description;
    this.image = image ?? "none";
    this.timestamp = Date.now();
    this.progress = this.deterministicProgress();
    const dataToHash = `${this.creator}:${this.tokenAddress}:${name}:${symbol}:${description}:${this.image}`;
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
  totalSupply: number;
  features: string[];
  tokenAllocation: { name: string; percentage: number }[];
  audit: string;
};

export class BuyEvent {
  buyer: string;
  amount: bigint;
  price: bigint;
  totalSupply: bigint;

  constructor(buyer: string, amount: bigint, price: bigint, totalSupply: bigint) {
    this.buyer = buyer;
    this.amount = amount;
    this.price = price;
    this.totalSupply = totalSupply;
  }

  static topic = "0x" + ethers.id("Buy(address,uint256,uint256,uint256)").slice(2); // event signature hash

  static abi = ["event Buy(address indexed buyer, uint256 amount, uint256 price, uint256 tokenTotalSupply)"];
}

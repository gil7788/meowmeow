import { id as keccak256, toUtf8Bytes } from "ethers";

export class TokenCreatedEvent {
  creator: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  keccak256Hash: string;
  timestamp: number;

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

    const dataToHash = `${creator}:${tokenAddress}:${name}:${symbol}:${description}:${this.image}`;
    this.keccak256Hash = keccak256(`0x${Buffer.from(toUtf8Bytes(dataToHash)).toString("hex")}`);
  }

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
}

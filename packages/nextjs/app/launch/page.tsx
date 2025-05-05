"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { id as keccak256, toUtf8Bytes } from "ethers";
import { ArrowLeft, Cat } from "lucide-react";
import { decodeEventLog } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { encodeBase64 } from "~~/utils/encoderBase64";

// import type { Address } from "viem";

// [TODO] Move to a config file
const FACTORY_ADDRESS = "0xa15bb66138824a1c7167f5e85b957d04dd34e468";

class TokenCreatedEvent {
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

function parseTokenCreatedEvent(decodedArgs: unknown): TokenCreatedEvent | null {
  if (typeof decodedArgs === "object" && decodedArgs !== null && !Array.isArray(decodedArgs)) {
    const obj = decodedArgs as Record<string, unknown>;
    for (const input of TokenCreatedEvent.abi[0].inputs) {
      if (typeof obj[input.name] !== "string") {
        throw new Error(
          `Invalid event arg ${input.name}: expected type ${input.type}, instead got ${typeof obj[input.name]}`,
        );
      }
    }

    const image = typeof obj.image === "string" ? obj.image : "";

    return new TokenCreatedEvent(
      obj.creator as string,
      obj.tokenAddress as string,
      obj.name as string,
      obj.symbol as string,
      obj.description as string,
      image as string,
    );
  }
  throw new Error("Invalid event args: one or more required fields are missing");
}

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const router = useRouter();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("MemeCoinFactory");

  function resetForm() {
    setName("");
    setSymbol("");
    setDescription("");
    setLogo(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const logoBase64 = await encodeBase64(logo);
      const eventSignature = "TokenCreated(address,address,string,string,string,string)";
      const TOKEN_CREATED_EVENT_SIG = keccak256(eventSignature);

      await writeContractAsync(
        {
          functionName: "mintNewToken",
          args: [name, symbol, description, logoBase64],
        },
        {
          onBlockConfirmation: txnReceipt => {
            let found = false;

            for (const log of txnReceipt.logs) {
              if (
                log.address?.toLowerCase() !== FACTORY_ADDRESS.toLowerCase() ||
                log.topics[0] !== TOKEN_CREATED_EVENT_SIG
              ) {
                continue;
              }

              try {
                const decoded = decodeEventLog({
                  abi: TokenCreatedEvent.abi,
                  data: log.data,
                  topics: log.topics,
                });

                const event = parseTokenCreatedEvent(decoded.args);
                if (event) {
                  console.debug("Token hash:", event.keccak256Hash);
                  console.debug("Timestamp:", new Date(event.timestamp).toISOString());

                  localStorage.setItem(`token-${event.keccak256Hash}`, JSON.stringify(event));
                  router.push(`/meme/${event.keccak256Hash}`);

                  found = true;
                  break;
                }
              } catch (error) {
                console.error("Failed to decode event log:", error);
              }
            }

            if (!found) {
              console.error(
                "Token launched, but could not find token address in logs. Make sure FACTORY_ADDRESS is correct and contract emits the event.",
              );
            }
          },
        },
      );

      resetForm();
    } catch (err) {
      console.error("Error submitting meme coin:", (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Submit Your Meme Coin</h1>
            <p className="mt-2 text-muted-foreground">
              Fill out the form below to submit your meme coin for listing on MeowMoew Pad.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide the basic details about your meme coin project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Coin Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. MeowZircuit"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g. MEOW"
                      required
                      value={symbol}
                      onChange={e => setSymbol(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your meme coin (max 150 characters)"
                    className="resize-none"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo Upload</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Cat className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="flex-1"
                      required
                      onChange={e => setLogo(e.target.files?.[0] || null)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a square image (recommended: 512x512px, max 2MB)
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Meme Coin"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2023 MeowMoew Pad. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

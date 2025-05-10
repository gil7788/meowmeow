"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseTokenCreatedLog } from "@/lib/onchainEventParser";
import { ethers } from "ethers";
import { ArrowLeft, Cat } from "lucide-react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { TokenCreatedEvent } from "~~/lib/types";
import { encodeBase64 } from "~~/utils/encoderBase64";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const router = useRouter();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("LaunchPad");

  function resetForm() {
    setName("");
    setSymbol("");
    setDescription("");
    setLogo(null);
  }

  // [TODO] Import from .env
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const logoBase64 = await encodeBase64(logo);
    const txHash = await writeContractAsync({
      functionName: "launchNewMeme",
      args: [name, symbol, description, logoBase64],
    });

    if (!txHash) throw new Error("Transaction failed to submit.");

    const receipt = await provider.waitForTransaction(txHash);
    if (!receipt) {
      throw new Error("Transaction receipt is null. Wait for transaction failed.");
    }

    try {
      const iface = new ethers.Interface(TokenCreatedEvent.abi);
      let parsedEvent: TokenCreatedEvent | null = null;

      for (const log of receipt.logs) {
        parsedEvent = parseTokenCreatedLog(log, iface);
        if (parsedEvent) break;
      }

      if (!parsedEvent) throw new Error("Could not find valid TokenCreated log in transaction receipt.");

      localStorage.setItem(`launched-token-${parsedEvent.tokenAddress}`, JSON.stringify(parsedEvent));
      router.push(`/meme/${parsedEvent.tokenAddress}`);
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

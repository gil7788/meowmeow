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
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePublicClient } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { TokenCreatedEvent } from "~~/lib/types";
import { encodeBase64 } from "~~/utils/encoderBase64";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [xProfile, setXProfile] = useState("");
  const [telegram, setTelegram] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [webpage, setWebpage] = useState("");
  const [expanded, setExpended] = useState(false);

  const router = useRouter();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("LaunchPad");
  const publicClient = usePublicClient();
  if (!publicClient) throw new Error("Public client is not ready.");

  function resetForm() {
    setName("");
    setSymbol("");
    setDescription("");
    setLogo(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoBase64: string;
    try {
      logoBase64 = await encodeBase64(logo);
    } catch (err) {
      console.error("Image encoding error:", err);
      return;
    }

    let txHash: string | undefined;
    try {
      txHash = await writeContractAsync({
        functionName: "launchNewMeme",
        args: [name, symbol, description, logoBase64],
      });
    } catch (err: any) {
      console.error("Contract execution failed:", err);
      return;
    }

    if (!txHash) {
      console.error(`Transaction submission failed, with functionName: "launchNewMeme",
        args: [${name}, ${symbol}, ${description}, ${logoBase64}].`);
      return;
    }

    let receipt;
    try {
      receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
    } catch (err) {
      alert("Failed to fetch transaction receipt.");
      console.error("Receipt error:", err);
      return;
    }

    let parsedEvent: TokenCreatedEvent | null = null;
    try {
      const iface = new ethers.Interface(TokenCreatedEvent.abi);
      for (const log of receipt.logs) {
        parsedEvent = parseTokenCreatedLog(log, iface);
        if (parsedEvent) break;
      }
      if (!parsedEvent) throw new Error("TokenCreated event not found.");
    } catch (err) {
      alert("Failed to extract token information from logs.");
      console.error("Log parsing error:", err);
      return;
    }

    try {
      localStorage.setItem(`launched-token-${parsedEvent.tokenAddress}`, JSON.stringify(parsedEvent));
      router.push(`/meme/${parsedEvent.tokenAddress}`);
      resetForm();
    } catch (err) {
      alert("Failed to store token data or redirect.");
      console.error("Post-launch error:", err);
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
              Fill out the form below to submit your meme coin for listing on MeowMeow Pad.
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
                      placeholder="MeowZircuit"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="MEOW"
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

                {/* <Button type="button" className="w-full" onClick={() => setExpended(prev => !prev)}>
                  {expanded ? "Less Details" : "More Details"}
                </Button> */}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpended(prev => !prev)}
                    className="flex items-center gap-1 text-sm"
                  >
                    {expanded ? (
                      <>
                        Less Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        More Details <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {expanded && (
                  <div>
                    <CardHeader>
                      <b>Additional Information</b>
                    </CardHeader>
                    <div className="space-y-2">
                      <Label htmlFor="x">X Account</Label>
                      <Input
                        id="x"
                        placeholder="https://x.com/memecoin"
                        value={xProfile}
                        onChange={e => setXProfile(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        placeholder="https://t.me/memecoin"
                        value={telegram}
                        onChange={e => setTelegram(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube Link</Label>
                      <Input
                        id="youtube"
                        placeholder="https://www.youtube.com/watch?v=vabXXkZjKiw"
                        value={youtubeLink}
                        onChange={e => setYoutubeLink(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram Profile</Label>
                      <Input
                        id="instagram"
                        placeholder="@yourprofile"
                        value={instagram}
                        onChange={e => setInstagram(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        placeholder="@yourtiktok"
                        value={tiktok}
                        onChange={e => setTiktok(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webpage">Webpage</Label>
                      <Input
                        id="webpage"
                        placeholder="yoursite.com"
                        value={webpage}
                        onChange={e => setWebpage(e.target.value)}
                      />
                    </div>
                  </div>
                )}

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
          <p className="text-xs text-muted-foreground">© 2023 MeowMeow Pad. All rights reserved.</p>
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

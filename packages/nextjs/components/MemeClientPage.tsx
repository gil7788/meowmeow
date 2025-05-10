"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MemeProfile from "./meme/MemeProfile";
import MemeTabs from "./meme/MemeTabs";
import TokenSaleCard from "./meme/TokenSaleCard";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { ethers } from "ethers";
import { ArrowLeft } from "lucide-react";
import { listenToBuyEvent } from "~~/lib/onchainEventListener";
import type { BuyEvent, ProjectData, TokenCreatedEvent } from "~~/lib/types";

const getFallbackProjectData = (id: string): ProjectData => ({
  id,
  name: "Default Name",
  description: "Default Description",
  longDescription: "Default Long Description",
  image: "/coin_placeholder.svg?height=300&width=300",
  raised: "$1.8M",
  goal: "$2.5M",
  progress: 72,
  startDate: "2023-06-15T10:00:00Z",
  endDate: "2023-06-30T10:00:00Z",
  status: "live",
  tokenSymbol: "TKN",
  tokenPrice: "$0.000042",
  totalSupply: 0,
  features: [
    "Automatic 5% reflection to all holders",
    "3% of each transaction goes to liquidity",
    "2% of each transaction goes to charity wallet",
    "Anti-whale mechanism (max wallet 2%)",
    "Community governance through DAO",
  ],
  tokenAllocation: [
    { name: "Public Sale", percentage: 40 },
    { name: "Marketing", percentage: 20 },
    { name: "Liquidity", percentage: 15 },
    { name: "Charity", percentage: 10 },
  ],
  audit: "Audited by CertiK",
});

export default function MemeClientPage({ hash }: { hash: string }) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [supply, setSupply] = useState<number>(0);

  useEffect(() => {
    const fallback = getFallbackProjectData(hash);
    const raw = localStorage.getItem(`launched-token-${hash}`);
    const token: TokenCreatedEvent | null = raw ? JSON.parse(raw) : null;

    if (!token) {
      setProject(fallback);
      return;
    }

    const projectData: ProjectData = {
      ...fallback,
      id: token.tokenAddress,
      name: token.name,
      description: token.description,
      tokenSymbol: token.symbol,
      image: token.image || fallback.image,
    };

    // [TODO] Move to event Listener
    // [TODO]: Revise fetch of recent token - can be further simplified by looking at LaunchPad Token array
    // [TODO]: Abstract away to 1 function that load the recent token and listens
    const fetchTotalSupply = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(token.tokenAddress, MemeCoinAbi, provider);
        const supply = await contract.totalSupply().then((val: ethers.BigNumberish) => Number(val));
        setSupply(supply);
        setProject({ ...projectData, totalSupply: supply });
      } catch (e) {
        console.warn("Could not fetch totalSupply", e);
        setProject(projectData);
      }
    };

    fetchTotalSupply();

    // Fetch and update progress - which total raised. one is fetched, update progress and progress bar
    const stopListening = listenToBuyEvent((event: BuyEvent) => {
      if (event && event.buyer && token.tokenAddress === hash) {
        const total = Number(event.totalSupply);
        setSupply(total);
        setProject(prev =>
          prev
            ? {
                ...prev,
                totalSupply: total,
              }
            : null,
        );
      }
    });

    return () => {
      if (typeof stopListening === "function") stopListening();
    };
  }, [hash]);

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <div className="container mx-auto max-w-5xl w-full">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Launches
          </Link>
        </div>
      </header>
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <MemeProfile project={project} />
              <MemeTabs meme={{ ...project, totalSupply: supply }} />
            </div>
            <TokenSaleCard project={project} />
          </div>
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

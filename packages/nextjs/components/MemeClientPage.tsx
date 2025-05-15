"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MemeProfile from "./meme/MemeProfile";
import MemeTabs from "./meme/MemeTabs";
import TokenSaleCard from "./meme/TokenSaleCard";
import { ArrowLeft } from "lucide-react";
import { usePublicClient } from "wagmi";
import type { ProjectData, TokenCreatedEvent } from "~~/lib/types";

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
  const publicClient = usePublicClient();
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    const fallback = getFallbackProjectData(hash);
    const raw = localStorage.getItem(`launched-token-${hash}`);
    const token: TokenCreatedEvent | null = raw ? JSON.parse(raw) : null;

    if (!token || !publicClient) {
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

    setProject(projectData);
  }, [hash, publicClient]);

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
              <MemeTabs meme={project} />
            </div>
            <TokenSaleCard project={project} hash={hash} />
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

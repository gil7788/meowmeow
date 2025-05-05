"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import { useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/countdown-timer";
import { TokenAllocation } from "@/components/token-allocation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { id as keccak256, toUtf8Bytes } from "ethers";
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { decodeBase64ToBlob } from "~~/utils/encoderBase64";

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
    image?: string,
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

type ProjectData = {
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

type ProjectPageProps = {
  params: { hash: string };
};

const getProjectData = (id: string): ProjectData => ({
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
  totalSupply: "100,000,000,000",
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // const searchParams = useSearchParams();
  // const hash = searchParams.get("hash");

  useEffect(() => {
    if (!params?.hash) return;

    const key = `token-${params.hash}`;
    const raw = localStorage.getItem(key);

    const fallback = getProjectData(params.hash);

    if (!raw) {
      setProject(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const token = new TokenCreatedEvent(
        parsed.creator,
        parsed.tokenAddress,
        parsed.name,
        parsed.symbol,
        parsed.description,
        parsed.image,
      );

      setProject({
        ...fallback,
        id: token.tokenAddress,
        name: token.name,
        description: token.description,
        tokenSymbol: token.symbol,
        image: token.image || fallback.image,
      });

      const blob = decodeBase64ToBlob(token.image);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to parse token data from localStorage:", err);
      setProject(fallback);
    }
  }, [params.hash]);

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading project...</p>
      </div>
    );
  } else {
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
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <Image
                      src={imageUrl || project.image}
                      alt={project.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">{project.name}</h1>
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {project.status === "live" ? "LIVE" : project.status.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>
                </div>

                <Tabs defaultValue="about">
                  <TabsList className="mb-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="about" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Project Overview</h3>
                      <p className="text-muted-foreground">{project.longDescription}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tokenomics">
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Token Symbol</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{project.tokenSymbol}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Token Price</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{project.tokenPrice}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{project.totalSupply}</div>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Token Allocation</h3>
                        <TokenAllocation data={project.tokenAllocation} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Sale</CardTitle>
                    <CardDescription>
                      {project.status === "upcoming"
                        ? "Starting soon"
                        : project.status === "live"
                          ? "Sale in progress"
                          : "Sale completed"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raised: {project.raised}</span>
                        <span>Goal: {project.goal}</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground">{project.progress}% Complete</div>
                    </div>

                    <div className="space-y-2">
                      {project.status === "live" ? (
                        <>
                          <div className="text-sm font-medium">Ends in</div>
                          <CountdownTimer targetDate={project.endDate} />
                        </>
                      ) : project.status === "upcoming" ? (
                        <>
                          <div className="text-sm font-medium">Starts in</div>
                          <CountdownTimer targetDate={project.startDate} />
                        </>
                      ) : (
                        <div className="text-sm font-medium text-muted-foreground">Sale completed</div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Start Date</span>
                        </div>
                        <div className="text-right">{formatDate(project.startDate)}</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>End Date</span>
                        </div>
                        <div className="text-right">{formatDate(project.endDate)}</div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duration</span>
                        </div>
                        <div className="text-right">
                          {Math.ceil(
                            (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Participants</span>
                        </div>
                        <div className="text-right">1,245</div>
                      </div>

                      <Button className="w-full" disabled={project.status === "completed"}>
                        {project.status === "upcoming"
                          ? "Remind Me"
                          : project.status === "live"
                            ? "Participate Now"
                            : "Sale Ended"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
}

import Link from "next/link"
import { Calendar, Clock, ExternalLink, Globe, Shield, Users, Cat } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountdownTimer } from "@/components/countdown-timer"
import { ProjectTeam } from "@/components/project-team"
import { TokenAllocation } from "@/components/token-allocation"

// This would normally come from a database or API
const getProjectData = (id: string) => {
  return {
    id,
    name: "MeowZircuit",
    description: "The ultimate meme coin for the Zircuit Network ecosystem with purr-fect tokenomics.",
    longDescription:
      "MeowZircuit is the first meme coin built specifically for the Zircuit Network. With its innovative tokenomics and community-driven approach, MeowZircuit aims to become the leading meme coin in the ecosystem. The token features automatic liquidity generation, reflection rewards for holders, and a charity wallet that supports animal shelters worldwide.",
    image: "/placeholder.svg?height=300&width=300",
    raised: "$1.8M",
    goal: "$2.5M",
    progress: 72,
    startDate: "2023-06-15T10:00:00Z",
    endDate: "2023-06-30T10:00:00Z",
    status: "live",
    website: "https://meowzircuit.example",
    whitepaper: "https://meowzircuit.example/whitepaper",
    tokenSymbol: "MEOW",
    tokenPrice: "$0.000042",
    totalSupply: "100,000,000,000",
    features: [
      "Automatic 5% reflection to all holders",
      "3% of each transaction goes to liquidity",
      "2% of each transaction goes to charity wallet",
      "Anti-whale mechanism (max wallet 2%)",
      "Community governance through DAO",
    ],
    roadmap: [
      { quarter: "Q3 2023", milestone: "Zircuit Network Launch" },
      { quarter: "Q4 2023", milestone: "MeowSwap DEX" },
      { quarter: "Q1 2024", milestone: "NFT Collection" },
      { quarter: "Q2 2024", milestone: "Cross-chain Bridge" },
    ],
    team: [
      { name: "Crypto Kitty", role: "Founder & Meme Lord", image: "/placeholder.svg?height=100&width=100" },
      { name: "Blockchain Whiskers", role: "Lead Developer", image: "/placeholder.svg?height=100&width=100" },
      { name: "Satoshi Paws", role: "Marketing", image: "/placeholder.svg?height=100&width=100" },
    ],
    tokenAllocation: [
      { name: "Public Sale", percentage: 40 },
      { name: "Team", percentage: 15 },
      { name: "Marketing", percentage: 20 },
      { name: "Liquidity", percentage: 15 },
      { name: "Charity", percentage: 10 },
    ],
    audit: "Audited by CertiK",
  }
}

// Format date in a consistent way for both server and client
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = getProjectData(params.id)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <div className="container mx-auto max-w-5xl w-full">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <Cat className="h-4 w-4" />
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
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
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
                  <div className="flex gap-4">
                    <Link
                      href={project.website}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Link>
                    <Link
                      href={project.whitepaper}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Whitepaper
                    </Link>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Project Overview</h3>
                    <p className="text-muted-foreground">{project.longDescription}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  {project.audit && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-500" />
                      {project.audit}
                    </div>
                  )}
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
                <TabsContent value="team">
                  <ProjectTeam team={project.team} />
                </TabsContent>
                <TabsContent value="roadmap">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-2">Project Roadmap</h3>
                    <div className="space-y-4">
                      {project.roadmap.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-20 font-semibold">{item.quarter}</div>
                          <div className="flex-1 pb-4 border-l pl-4 border-muted">
                            <div className="font-medium">{item.milestone}</div>
                          </div>
                        </div>
                      ))}
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

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have questions about this project or how to participate?
                  </p>
                  <Button variant="outline" className="w-full">
                    Join Community
                  </Button>
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
  )
}

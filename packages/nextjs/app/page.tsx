"use client";

// import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Address } from "~~/components/scaffold-eth";
import { ArrowRight } from "lucide-react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
        {/* <header className="px-4 lg:px-6 h-14 flex items-center border-b">
          <div className="container mx-auto max-w-5xl flex items-center justify-between w-full">
            <Link className="flex items-center justify-center" href="/">
              <Cat className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-bold">MeowMoew Pad</span>
            </Link>
            <div className="flex items-center">
              <nav className="flex gap-4 sm:gap-6 mr-4">
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                  Launches
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                  Projects
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                  Learn
                </Link>
              </nav>
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </header> */}
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Launch Your Meme Coin on Zircuit Network
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    The purr-fect launchpad for meme coins. Join the next generation of viral tokens on Zircuit Network.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Explore Meme Coins
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/launch">Submit Your Meme</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              <div className="flex flex-col gap-4 md:gap-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter">Featured Launches</h2>
                  <p className="text-muted-foreground">Don&apos;t miss out on these paw-some opportunities</p>
                </div>
                <div className="relative">
                  <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4">
                      {[
                        {
                          id: "1",
                          name: "MeowZircuit",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 72,
                        },
                        {
                          id: "2",
                          name: "ZircDoge",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 45,
                        },
                        {
                          id: "3",
                          name: "PepeFrog",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 89,
                        },
                        {
                          id: "4",
                          name: "CatCoin",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 32,
                        },
                        {
                          id: "5",
                          name: "MoonShot",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 67,
                        },
                        {
                          id: "6",
                          name: "RocketPaw",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 54,
                        },
                        {
                          id: "7",
                          name: "StarMeow",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 91,
                        },
                        {
                          id: "8",
                          name: "ZircuitPup",
                          image: "/coin_placeholder.svg?height=100&width=100",
                          progress: 28,
                        },
                      ].map(coin => (
                        <div key={coin.id} className="min-w-[250px] snap-start flex-shrink-0">
                          <Link href={`/projects/${coin.id}`}>
                            <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-3">
                                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                                    <Image
                                      src={/*coin.image ||*/ "/coin_placeholder.svg"}
                                      alt={coin.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                    {/* <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" /> */}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{coin.name}</h3>
                                    <div className="mt-2">
                                      <Progress value={coin.progress} className="h-1.5 w-full" />
                                      <p className="text-xs text-muted-foreground mt-1">{coin.progress}% Funded</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              <div className="flex flex-col gap-4 md:gap-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter">Trending Meme Coins</h2>
                  <p className="text-muted-foreground">The latest meme coins on Zircuit Network</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 36 }).map((_, index) => {
                    // Generate some varied data for demonstration
                    const progress = Math.floor(Math.random() * 100);
                    const coinNames = [
                      "MeowZircuit",
                      "ZircDoge",
                      "PepeFrog",
                      "CatCoin",
                      "MoonShot",
                      "RocketPaw",
                      "StarMeow",
                      "ZircuitPup",
                      "FroggyZ",
                      "KittyMoon",
                      "DogeMoon",
                      "CryptoKitty",
                    ];
                    const name = `${coinNames[index % coinNames.length]}${Math.floor(index / coinNames.length) + 1}`;

                    return (
                      <Link href={`/projects/${index + 1}`} key={index}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted/50 flex-shrink-0 flex items-center justify-center">
                                <Image
                                  src={`/coin_placeholder.svg?text=${index + 1}`}
                                  alt={name}
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{name}</h3>
                                <div className="mt-1">
                                  <Progress value={progress} className="h-1 w-full" />
                                  <div className="flex justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">{progress}%</p>
                                    <p className="text-xs text-green-500">+{(Math.random() * 20).toFixed(1)}%</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline">View All Meme Coins</Button>
                </div>
              </div>
            </div>
          </section>
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
    </>
  );
};

export default Home;

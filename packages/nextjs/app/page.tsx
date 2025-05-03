"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const featuredLaunches = [
    { id: "1", name: "MeowZircuit", progress: 72 },
    { id: "2", name: "ZircDoge", progress: 45 },
    { id: "3", name: "PepeFrog", progress: 89 },
    { id: "4", name: "CatCoin", progress: 32 },
    { id: "5", name: "MoonShot", progress: 67 },
    { id: "6", name: "RocketPaw", progress: 54 },
    { id: "7", name: "StarMeow", progress: 91 },
    { id: "8", name: "ZircuitPup", progress: 28 },
  ];

  const [trendingCoins, setTrendingCoins] = useState<{ id: number; name: string; progress: number; change: string }[]>(
    [],
  );

  useEffect(() => {
    const coins = Array.from({ length: 36 }).map((_, index) => {
      const progress = Math.floor(Math.random() * 100);
      const change = (Math.random() * 20).toFixed(1);
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
      return { id: index + 1, name, progress, change };
    });
    setTrendingCoins(coins);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scrollLeftFunc = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRightFunc = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Launch Your Meme Coin on Zircuit Network
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              The purr-fect launchpad for meme coins. Join the next generation of viral tokens on Zircuit Network.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Button size="lg">
                Explore Meme Coins
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/launch">Submit Your Meme</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Launches */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col gap-4 md:gap-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Featured Launches</h2>
                <p className="text-muted-foreground">Don&apos;t miss out on these paw-some opportunities</p>
              </div>
              <div className="relative">
                {showLeft && (
                  <Button
                    onClick={scrollLeftFunc}
                    size="icon"
                    variant="outline"
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}

                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 scroll-smooth"
                >
                  <div className="flex gap-4">
                    {featuredLaunches.map(coin => (
                      <div key={coin.id} className="min-w-[250px] snap-start flex-shrink-0">
                        <Link href={`/projects/${coin.id}`}>
                          <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                                  <Image
                                    src={`/coin_placeholder.svg?text=${coin.name}`}
                                    alt={coin.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
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

                {showRight && (
                  <Button
                    onClick={scrollRightFunc}
                    size="icon"
                    variant="outline"
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Meme Coins */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col gap-4 md:gap-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Trending Meme Coins</h2>
                <p className="text-muted-foreground">The latest meme coins on Zircuit Network</p>
              </div>
              {trendingCoins.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingCoins.map(({ id, name, progress, change }) => (
                    <Link href={`/projects/${id}`} key={id}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                              <Image src={`/coin_placeholder.svg?text=${id}`} alt={name} width={40} height={40} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{name}</h3>
                              <div className="mt-1">
                                <Progress value={progress} className="h-1 w-full" />
                                <div className="flex justify-between mt-1">
                                  <p className="text-xs text-muted-foreground">{progress}%</p>
                                  <p className="text-xs text-green-500">+{change}%</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex justify-center">
                <Button variant="outline">View All Meme Coins</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
};

export default Home;

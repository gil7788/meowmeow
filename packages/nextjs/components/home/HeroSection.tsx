"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => (
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
);

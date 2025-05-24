"use client";

import React from "react";
import { TrendingCoinCard } from "@/components/home/TrendingCoinCard";
import { Button } from "@/components/ui/button";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";

export const TrendingCoins = () => {
  const { tokens, images, loading, error } = useTrendingTokens();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="flex flex-col gap-4 md:gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Trending Meme Coins</h2>
            <p className="text-muted-foreground">The latest meme coins on Zircuit Network</p>
          </div>

          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-center text-sm text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map(token => (
                <TrendingCoinCard key={token.tokenAddress} token={token} imageUrl={images[token.tokenAddress]} />
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline">View All Meme Coins</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

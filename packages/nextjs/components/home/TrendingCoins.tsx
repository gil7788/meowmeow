"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TokenCreatedEvent } from "@/lib/types";
import { decodeBase64ToBlob } from "@/utils/encoderBase64";
import { getAllRecentTokenCreatedEvents, listenToTokenCreated } from "~~/lib/onchainEventListener";

const SEARCH_INTERVAL = 5000;
const MAX_EVENTS = 48;

export const TrendingCoins = () => {
  const imageUrlsRef = useRef<string[]>([]);
  const [tokens, setTokens] = useState<TokenCreatedEvent[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const urlsToRevoke: string[] = imageUrlsRef.current;

    const extractImages = (events: TokenCreatedEvent[]) => {
      const newImages: Record<string, string> = {};

      events.forEach(event => {
        if (event.image && event.image !== "none") {
          try {
            const blob = decodeBase64ToBlob(event.image);
            const url = URL.createObjectURL(blob);
            newImages[event.tokenAddress] = url;
            imageUrlsRef.current.push(url);
          } catch {
            console.warn(`Failed to parse meme image.`);
          }
        }
      });

      setImages(prev => ({ ...prev, ...newImages }));
    };

    // [TODO]: Revise fetch of recent token - can be further simplified by looking at LaunchPad Token array
    // [TODO]: Abstract away to 1 function that load the recent token and listens
    const loadInitialTokens = async () => {
      const initialTokens = await getAllRecentTokenCreatedEvents(SEARCH_INTERVAL, MAX_EVENTS);
      setTokens(initialTokens);
      extractImages(initialTokens);
    };

    loadInitialTokens();

    const stopListening = listenToTokenCreated((parsedEvent: TokenCreatedEvent) => {
      setTokens(prev => {
        const updated = [parsedEvent, ...prev];
        extractImages([parsedEvent]);
        return updated.slice(0, MAX_EVENTS);
      });
    });

    return () => {
      stopListening();
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="flex flex-col gap-4 md:gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Trending Meme Coins</h2>
            <p className="text-muted-foreground">The latest meme coins on Zircuit Network</p>
          </div>
          {tokens.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map(token => (
                <Link href={`/meme/${token.tokenAddress}`} key={token.tokenAddress}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                          <Image
                            src={images[token.tokenAddress] || `/coin_placeholder.svg?text=${token.symbol}`}
                            alt={token.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{token.name}</h3>
                          <div className="mt-1">
                            <Progress value={token.progress} className="h-1 w-full" />
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-muted-foreground">{token.progress}% Funded</p>
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
  );
};

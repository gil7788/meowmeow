"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TokenCreatedEvent } from "@/lib/types";
import { decodeBase64ToBlob } from "@/utils/encoderBase64";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllRecentTokenCreatedEvents, listenToTokenCreated } from "~~/lib/onchainEventListener";

const SEARCH_INTERVAL = 5000;
const MAX_EVENTS = 8;

export const FeaturedLaunches = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageUrlsRef = useRef<string[]>([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [tokens, setTokens] = useState<TokenCreatedEvent[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    const el = scrollRef.current;
    const urlsToRevoke: string[] = imageUrlsRef.current;

    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);

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
            console.warn("Failed to parse image for:", event.tokenAddress);
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
      el.removeEventListener("scroll", checkScroll);
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const scroll = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
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
                onClick={() => scroll(-300)}
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
                {tokens.map(coin => (
                  <div key={coin.tokenAddress} className="min-w-[250px] snap-start flex-shrink-0">
                    <Link href={`/meme/${coin.tokenAddress}`}>
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                              <Image
                                src={images[coin.tokenAddress] || `/coin_placeholder.svg?text=${coin.name}`}
                                alt={coin.name}
                                width={64}
                                height={64}
                                className="object-cover"
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
                onClick={() => scroll(300)}
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
  );
};

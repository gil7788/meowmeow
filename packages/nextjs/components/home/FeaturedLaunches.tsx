"use client";

import React, { useEffect, useRef, useState } from "react";
import { FeaturedTokenCard } from "@/components/home/FeaturedTokenCard";
import { Button } from "@/components/ui/button";
import { useFeaturedTokens } from "@/hooks/useFeaturedTokens";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeaturedLaunches = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const { tokens, images, loading, error } = useFeaturedTokens();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
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
                {loading || error ? (
                  <p className="text-sm text-muted-foreground">{error || "Loading featured tokens..."}</p>
                ) : (
                  tokens.map(token => (
                    <div key={token.tokenAddress} className="min-w-[250px] snap-start flex-shrink-0">
                      <FeaturedTokenCard token={token} image={images[token.tokenAddress]} />
                    </div>
                  ))
                )}
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

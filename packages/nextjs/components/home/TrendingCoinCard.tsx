"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTokenEthBalance } from "@/hooks/useTokenEthBalance";
import { TokenCreatedEvent } from "@/lib/types";

interface TrendingCoinCardProps {
  token: TokenCreatedEvent;
  imageUrl: string;
}

export const TrendingCoinCard: React.FC<TrendingCoinCardProps> = ({ token, imageUrl }) => {
  const { progress } = useTokenEthBalance(token.tokenAddress);

  return (
    <Link href={`/meme/${token.tokenAddress}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
              <Image
                src={imageUrl || `/coin_placeholder.svg?text=${token.symbol}`}
                alt={token.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{token.name}</h3>
              <div className="mt-1">
                <Progress value={progress} className="h-1 w-full" />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{progress.toFixed(2)}% Funded</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTokenEthBalance } from "@/hooks/useTokenEthBalance";
import { TokenCreatedEvent } from "@/lib/types";

export function FeaturedTokenCard({ token, image }: { token: TokenCreatedEvent; image: string }) {
  const { progress } = useTokenEthBalance(token.tokenAddress);

  return (
    <Link href={`/meme/${token.tokenAddress}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
              <Image
                src={image || `/coin_placeholder.svg?text=${token.name}`}
                alt={token.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{token.name}</h3>
              <div className="mt-2">
                <Progress value={progress ?? 0} className="h-1.5 w-full" />
                <p className="text-xs text-muted-foreground mt-1">{progress?.toFixed(2) ?? "0.00"}% Funded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

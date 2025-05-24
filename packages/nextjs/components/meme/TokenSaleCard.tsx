"use client";

import { useEffect } from "react";
import { TokenBalance } from "@/components/meme/TokenBalance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenEthBalance } from "@/hooks/useTokenEthBalance";
import { ProjectData } from "@/lib/types";
import { listenToBuyEvent, listenToSellEvent } from "~~/lib/onchainEventListener";

export default function TokenSaleCard({ project, hash }: { project: ProjectData; hash: string }) {
  const { raisedEth, ethMaxCap, progress, loading, error, refresh } = useTokenEthBalance(hash);
  const { totalSupply, userBalance, symbol } = useTokenBalance(hash);

  useEffect(() => {
    const offBuy = listenToBuyEvent((_, __, ___, ____, event) => {
      if (event?.address?.toLowerCase() === hash.toLowerCase()) {
        refresh();
      }
    });

    const offSell = listenToSellEvent(({ token }) => {
      if (token.toLowerCase() === hash.toLowerCase()) {
        refresh();
      }
    });

    return () => {
      offBuy();
      offSell();
    };
  }, [hash, refresh]);

  return (
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
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading token sale data...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Raised: <b>{raisedEth.toFixed(2)} ETH</b>
                </span>
                <span>
                  Goal: <b>{ethMaxCap.toFixed(2)} ETH</b>
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-right text-muted-foreground">{progress.toFixed(2)}% Complete</div>
            </div>
          )}

          <Separator />

          <TokenBalance totalSupply={totalSupply} userBalance={userBalance} tokenSymbol={symbol} />
        </CardContent>
      </Card>
    </div>
  );
}

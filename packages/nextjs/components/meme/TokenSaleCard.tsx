"use client";

import { useEffect, useState } from "react";
import AuctionAbi from "@/abi/BondingCurveAuction.json";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { TokenBalance } from "@/components/meme/TokenBalance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { ProjectData } from "@/lib/types";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { publicFetch } from "~~/lib/onchainEventListener";

function useTokenEthBalance(tokenAddress: string) {
  const publicClient = usePublicClient();
  const [raisedEth, setRaisedEth] = useState<number>(0);
  const [ethMaxCap, setMaxCap] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicClient || !tokenAddress) return;

      try {
        const auctionAddress = await publicFetch(publicClient, tokenAddress, "owner", MemeCoinAbi, []);
        if (auctionAddress) {
          const balance = await publicClient.getBalance({
            address: auctionAddress as `0x${string}`,
          });
          const maxCap = await publicFetch(publicClient, tokenAddress, "maxCap", AuctionAbi, []);

          if (balance !== undefined) {
            setRaisedEth(Number(formatEther(balance)));
          }

          if (maxCap !== undefined) {
            setMaxCap(Number(formatEther(maxCap)));
          }
        }
      } catch (e) {
        console.error("Failed to fetch token balance", e);
      }
    };

    fetchBalance();
  }, [publicClient, tokenAddress]);

  useEffect(() => {
    if (ethMaxCap !== 0) {
      setProgress((raisedEth / ethMaxCap) * 100);
    }
  }, [raisedEth, ethMaxCap]);

  return { raisedEth, ethMaxCap, progress };
}

export default function TokenSaleCard({ project, hash }: { project: ProjectData; hash: string }) {
  const { raisedEth, ethMaxCap, progress } = useTokenEthBalance(hash);
  const { totalSupply, userBalance, symbol } = useTokenBalance(hash); // hash is the token address

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
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Raised: <b>{parseFloat(raisedEth.toString()).toFixed(2)} ETH</b>
              </span>
              <span>
                Goal: <b>{ethMaxCap.toString()} ETH</b>
              </span>
            </div>
            <Progress value={parseFloat(progress.toString())} className="h-2" />
            <div className="text-xs text-right text-muted-foreground">{progress.toFixed(2)}% Complete</div>
          </div>

          <Separator />

          <TokenBalance totalSupply={totalSupply} userBalance={userBalance} tokenSymbol={symbol} />
        </CardContent>
      </Card>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import AuctionAbi from "@/abi/BondingCurveAuction.json";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { listenToBuyEvent, listenToSellEvent, publicFetch } from "~~/lib/onchainEventListener";

export function useTokenEthBalance(tokenAddress: string) {
  const publicClient = usePublicClient();
  const [raisedEth, setRaisedEth] = useState<number>(0);
  const [ethMaxCap, setMaxCap] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicClient || !tokenAddress) return;

    setLoading(true);
    setError(null);
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
      setError("Failed to fetch token sale data");
    } finally {
      setLoading(false);
    }
  }, [publicClient, tokenAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (ethMaxCap > 0) {
      setProgress((raisedEth / ethMaxCap) * 100);
    }
  }, [raisedEth, ethMaxCap]);

  useEffect(() => {
    const offBuy = listenToBuyEvent((buyer, amount, price, totalSupply, event: any) => {
      if (event?.address?.toLowerCase() === tokenAddress.toLowerCase()) {
        fetchBalance();
      }
    });

    const offSell = listenToSellEvent(({ token }) => {
      if (token.toLowerCase() === tokenAddress.toLowerCase()) {
        fetchBalance();
      }
    });

    return () => {
      offBuy();
      offSell();
    };
  }, [tokenAddress, fetchBalance]);

  return {
    raisedEth,
    ethMaxCap,
    progress,
    loading,
    error,
    refresh: fetchBalance,
  };
}

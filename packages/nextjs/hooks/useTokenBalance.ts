import { useCallback, useEffect, useState } from "react";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { useAccount, usePublicClient } from "wagmi";
import { publicFetch } from "~~/lib/onchainEventListener";

export function useTokenBalance(tokenAddress: string) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<bigint>(0n);
  const [symbol, setSymbol] = useState<string>("TOKEN");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTokenStats = useCallback(async () => {
    if (!publicClient || !address || !tokenAddress) return;

    setLoading(true);
    try {
      const [supply, balance, symbol] = await Promise.all([
        publicFetch(publicClient, tokenAddress, "totalSupply", MemeCoinAbi, []),
        publicFetch(publicClient, tokenAddress, "balanceOf", MemeCoinAbi, [address]),
        publicFetch(publicClient, tokenAddress, "symbol", MemeCoinAbi, []),
      ]);
      setTotalSupply(Number(supply));
      setUserBalance(balance as bigint);
      setSymbol(symbol as string);
    } catch (err) {
      console.error("Error fetching token stats:", err);
    } finally {
      setLoading(false);
    }
  }, [publicClient, address, tokenAddress]);

  useEffect(() => {
    fetchTokenStats();
  }, [fetchTokenStats]);

  return { totalSupply, userBalance, symbol, refresh: fetchTokenStats, loading };
}

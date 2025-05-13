"use client";

import { useEffect, useState } from "react";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { EstimatedCost } from "@/components/meme/EstimatedCost";
import { InputAmount } from "@/components/meme/InputAmount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedEthUnits } from "@/utils/ethUnits";
import { ethers } from "ethers";
import { ArrowDownUp } from "lucide-react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface BuySellTabProps {
  isBuying: boolean;
  toggleTradeDirection: () => void;
  amount: string;
  setAmount: (val: string) => void;
  receiveAmount: string;
  tokenSymbol: string;
  tokenAddress: string;
  totalSupply: number;
  setTotalSupply: (val: number) => void;
}

export const BuySellTab: React.FC<BuySellTabProps> = ({
  isBuying,
  toggleTradeDirection,
  amount,
  setAmount,
  receiveAmount,
  tokenSymbol,
  tokenAddress,
  totalSupply,
  setTotalSupply,
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "LaunchPad" });
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<bigint>(0n);
  const [priceOracleWithUnit, setPriceOracleWithUnit] = useState<FormattedEthUnits>(new FormattedEthUnits());

  const fetchUserBalance = async () => {
    if (!publicClient || !address || !ethers.isAddress(tokenAddress)) return setUserBalance(0n);
    try {
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: MemeCoinAbi,
        functionName: "balanceOf",
        args: [address],
      });
      setUserBalance(balance as bigint);
    } catch (e) {
      console.error("Failed to fetch token balance:", e);
      setUserBalance(0n);
    }
  };

  const fetchTotalSupply = async () => {
    try {
      const updated = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: MemeCoinAbi,
        functionName: "totalSupply",
      });
      setTotalSupply(Number(updated));
    } catch (e) {
      console.error("Failed to fetch total supply:", e);
    }
  };

  useEffect(() => {
    fetchUserBalance();
    fetchTotalSupply();
  }, [publicClient, tokenAddress, address]);

  const handleTrade = async () => {
    if (!walletClient || !address || !ethers.isAddress(tokenAddress)) return notification.error("Invalid wallet/token");
    if (!publicClient) return notification.error("Blockchain client not ready");

    try {
      setIsLoading(true);
      const parsedAmount = BigInt(amount);

      console.log(`Paying: ${priceOracleWithUnit.getWeiPrice()}`);
      if (isBuying) {
        const txHash = await writeContractAsync({
          functionName: "buy",
          args: [tokenAddress, parsedAmount],
          value: priceOracleWithUnit.getWeiPrice(),
        });

        if (!txHash) throw new Error("No tx hash");
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } else {
        if (userBalance < parsedAmount) return notification.error("Insufficient balance");
        const signer = await new ethers.BrowserProvider(walletClient.transport).getSigner();
        const memeCoin = new ethers.Contract(tokenAddress, MemeCoinAbi, signer);
        await (await memeCoin.approve(deployedContracts[31337].LaunchPad.address, parsedAmount)).wait();
        const txHash = await writeContractAsync({ functionName: "sell", args: [tokenAddress, parsedAmount] });
        if (!txHash) throw new Error("No tx hash");
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await fetchTotalSupply();
      await fetchUserBalance();
    } catch (err) {
      console.error("Trade error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {tokenSymbol}/ETH</CardTitle>
        <div>
          <CardDescription>{isBuying ? `Buy ${tokenSymbol}` : `Sell ${tokenSymbol}`}</CardDescription>
          <Button variant="ghost" onClick={toggleTradeDirection}>
            <ArrowDownUp className="h-4 w-4" />
            {isBuying ? "Sell" : "Buy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <InputAmount amount={amount} setAmount={setAmount} tokenSymbol={tokenSymbol} />
          <EstimatedCost
            amount={amount}
            isBuying={isBuying}
            totalSupply={totalSupply}
            setPriceOracleWithUnit={setPriceOracleWithUnit}
          />
          <div className="pt-4">
            <Button className="w-full" onClick={handleTrade} disabled={isLoading || !address || isPending}>
              {isLoading || isPending
                ? "Processing..."
                : address
                  ? `${isBuying ? "Buy" : "Sell"}`
                  : "Connect Wallet to Trade"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <b>Total Supply</b>
              <p>{totalSupply.toLocaleString("en-US")}</p>
            </div>
            <div>
              <p>
                <b>You Own</b>
              </p>
              <p>
                {ethers.formatUnits(userBalance, 0)} {tokenSymbol}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

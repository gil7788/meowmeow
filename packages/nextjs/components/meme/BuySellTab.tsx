"use client";

import { useEffect, useState } from "react";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import { ArrowDownUp } from "lucide-react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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
  const { writeContractAsync, isPending } = useScaffoldWriteContract("LaunchPad");
  const [isLoading, setIsLoading] = useState(false);
  const [priceOracle, setPriceOracle] = useState<bigint>(0n);

  // [TODO]: Probably can be tightened, from smart contract we know that value = priceOracle + 1
  function getPriceOracle(amount: bigint, totalSupply: bigint, isBuying: boolean): bigint {
    const fee = 1.03;
    let rawPrice = 0;

    if (isBuying) {
      for (let i = totalSupply + 1n; i <= totalSupply + amount; i++) {
        rawPrice += Number(i * i);
      }
      return BigInt(Math.ceil(rawPrice * fee));
    } else {
      if (totalSupply <= amount) {
        throw new Error(`Invalid sell amount. Total supply ${totalSupply} must be greater than amount ${amount}`);
      }
      for (let i = totalSupply; i > totalSupply - amount; i--) {
        rawPrice += Number(i * i);
      }
      return BigInt(Math.floor(rawPrice * fee));
    }
  }

  useEffect(() => {
    if (!walletClient || !ethers.isAddress(tokenAddress) || !amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
      setPriceOracle(0n);
      return;
    }

    try {
      const parsedAmount = BigInt(amount);
      const price = getPriceOracle(parsedAmount, BigInt(totalSupply), isBuying);
      setPriceOracle(price);
    } catch (e) {
      console.error("Failed to compute price oracle:", e);
      setPriceOracle(0n);
    }
  }, [amount, isBuying, totalSupply, tokenAddress, walletClient]);

  const handleTrade = async () => {
    if (!walletClient || !address || !ethers.isAddress(tokenAddress)) {
      alert("Invalid wallet or token address.");
      return;
    }

    if (!publicClient) {
      alert("Blockchain client is not ready.");
      return;
    }

    try {
      setIsLoading(true);
      const parsedAmount = BigInt(amount);

      if (isBuying) {
        const txHash = await writeContractAsync({
          functionName: "buy",
          args: [tokenAddress, parsedAmount],
          value: priceOracle + 10n,
        });
        if (!txHash) throw new Error("Transaction not submitted.");
        await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });

        const updated = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: MemeCoinAbi,
          functionName: "totalSupply",
        });
        setTotalSupply(Number(updated));
      } else {
        const signer = await new ethers.BrowserProvider(walletClient.transport).getSigner();
        const memeCoin = new ethers.Contract(tokenAddress, MemeCoinAbi, signer);

        const approvalTx = await memeCoin.approve(deployedContracts[31337].LaunchPad.address, parsedAmount);
        await approvalTx.wait();

        const txHash = await writeContractAsync({
          functionName: "sell",
          args: [tokenAddress, parsedAmount],
        });
        if (!txHash) throw new Error("Sell transaction not submitted.");
        await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });

        const updated = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: MemeCoinAbi,
          functionName: "totalSupply",
        });
        setTotalSupply(Number(updated));
      }

      alert(`${isBuying ? "Bought" : "Sold"} successfully`);
    } catch (err: any) {
      console.error("Trade error:", err);
      alert("Trade failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {tokenSymbol}/ZRC</CardTitle>
        <CardDescription>{isBuying ? `Buy ${tokenSymbol} using ZRC` : `Sell ${tokenSymbol} for ZRC`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                className="flex-1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <Button variant="outline" className="w-24">
                {isBuying ? "ZRC" : tokenSymbol}
              </Button>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTradeDirection}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receive">Receive (estimated)</Label>
            <div className="flex gap-2">
              <Input id="receive" type="text" placeholder="0.0" className="flex-1" value={receiveAmount} readOnly />
              <Button variant="outline" className="w-24">
                {isBuying ? tokenSymbol : "ZRC"}
              </Button>
            </div>
          </div>

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
              <p>Price (est.)</p>
              <p className="font-medium text-foreground">{priceOracle.toString()} wei</p>
              <p>Total Supply {totalSupply.toLocaleString("en-US")}</p>
            </div>
            <div>
              <p>Liquidity</p>
              <p className="font-medium text-foreground">234,567 ZRC</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

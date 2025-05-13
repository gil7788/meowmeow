"use client";

import { useEffect, useState } from "react";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedEthUnits, UnitInfo } from "@/utils/ethUnits";
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

  function getPriceOracle(amount: bigint, totalSupply: bigint, isBuying: boolean): bigint {
    if (!isBuying && totalSupply <= amount) {
      return 0n;
    }

    const feeNumerator = 110n;
    const feeDenominator = 100n;
    let rawPrice = 0n;

    if (isBuying) {
      for (let i = totalSupply + 1n; i <= totalSupply + amount; i++) {
        rawPrice += i * i;
      }
      // Apply ceil(rawPrice * fee)
      return (rawPrice * feeNumerator) / feeDenominator + 1n;
    } else {
      if (totalSupply < amount) {
        throw new Error(`Invalid sell amount. Total supply ${totalSupply} must be >= amount ${amount}`);
      }
      for (let i = totalSupply; i > totalSupply - amount; i--) {
        rawPrice += i * i;
      }
      return (rawPrice * feeNumerator) / feeDenominator - 1n;
    }
  }

  // Update Price
  useEffect(() => {
    try {
      if (!amount || isNaN(Number(amount))) {
        setPriceOracleWithUnit(new FormattedEthUnits());
        return;
      }

      const parsedAmount = BigInt(amount);
      if (parsedAmount <= 0n) {
        setPriceOracleWithUnit(new FormattedEthUnits());
        return;
      }

      const price = getPriceOracle(parsedAmount, BigInt(totalSupply), isBuying);
      setPriceOracleWithUnit(new FormattedEthUnits(price));
    } catch (err) {
      setPriceOracleWithUnit(new FormattedEthUnits()); // fallback to 0 on invalid input
    }
  }, [amount, isBuying, totalSupply]);

  const [selectedUnit, setSelectedUnit] = useState<string>(priceOracleWithUnit.unit);
  const [displayPrice, setDisplayPrice] = useState<string>(priceOracleWithUnit.toFixed());
  const [isUnitManuallySelected, setIsUnitManuallySelected] = useState(false);
  
  // Update display price on unit or price change
  useEffect(() => {
    const unit = priceOracleWithUnit.getPriceByUnit(selectedUnit);
    setDisplayPrice(unit.value.toString());
  }, [priceOracleWithUnit, selectedUnit]);
  
  // Auto-select unit when priceOracleWithUnit changes (if not manually set)
  useEffect(() => {
    if (!isUnitManuallySelected) {
      setSelectedUnit(priceOracleWithUnit.unit);
    }
  }, [priceOracleWithUnit]);

  const fetchUserBalance = async () => {
    if (!publicClient || !address || !ethers.isAddress(tokenAddress)) {
      setUserBalance(0n);
      return;
    }

    try {
      const balance = (await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: MemeCoinAbi,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      console.log("✅ User token balance fetched:", balance.toString());
      setUserBalance(balance);
    } catch (e) {
      console.error("❌ Failed to fetch token balance:", e);
      setUserBalance(0n);
    }
  };

  if (!publicClient || !address || !ethers.isAddress(tokenAddress)) {
    setUserBalance(0n);
    return;
  }

  const fetchTotalSupply = async () => {
    try {
      const updated = (await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: MemeCoinAbi,
        functionName: "totalSupply",
      })) as bigint;

      console.log("✅ Total supply fetched:", updated.toString());
      setTotalSupply(Number(updated));
    } catch (e) {
      console.error("❌ Failed to fetch total supply:", e);
    }
  };

  useEffect(() => {
    fetchUserBalance();
    fetchTotalSupply();
  }, [publicClient, tokenAddress, address]);

  const handleTrade = async () => {
    if (!walletClient || !address || !ethers.isAddress(tokenAddress)) {
      notification.error("❌ Invalid wallet or token address.");
      console.error("❌ Invalid wallet or token address.");
      return;
    }

    if (!publicClient) {
      notification.error("Blockchain client is not ready.");
      console.error("❌ Blockchain client is not ready.");
      return;
    }

    try {
      setIsLoading(true);
      const parsedAmount = BigInt(amount);

      console.log(`📤 Starting ${isBuying ? "buy" : "sell"} trade...`);
      console.log("Amount:", parsedAmount.toString());
      console.log("User balance:", userBalance.toString());
      console.log("Total supply:", totalSupply.toString());

      if (isBuying) {
        const txHash = await writeContractAsync({
          functionName: "buy",
          args: [tokenAddress, parsedAmount],
          value: priceOracleWithUnit.getWeiPrice(),
        });

        if (!txHash) throw new Error("Transaction hash is undefined.");

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        const tx = await publicClient.getTransaction({ hash: txHash });

        const costInWei = tx.gasPrice! * BigInt(receipt.gasUsed);
        const costInEth = ethers.formatEther(costInWei);
        console.log(`✅ Buy TX Cost: ${costInWei.toString()} wei (${costInEth} ETH)`);
        notification.success(`✅ Buy TX Cost: ${costInEth} ETH`);
      } else {
        if (userBalance < parsedAmount) {
          notification.error(`Insufficient ${tokenSymbol} balance to sell.`);
          return;
        }

        const signer = await new ethers.BrowserProvider(walletClient.transport).getSigner();
        const memeCoin = new ethers.Contract(tokenAddress, MemeCoinAbi, signer);

        const balanceBefore = await publicClient.getBalance({ address });

        const approvalTx = await memeCoin.approve(deployedContracts[31337].LaunchPad.address, parsedAmount);
        await approvalTx.wait();

        const txHash = await writeContractAsync({
          functionName: "sell",
          args: [tokenAddress, parsedAmount],
        });

        if (!txHash) throw new Error("Transaction hash is undefined.");

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        const tx = await publicClient.getTransaction({ hash: txHash });

        const costInWei = tx.gasPrice! * BigInt(receipt.gasUsed);
        const costInEth = ethers.formatEther(costInWei);
        console.log(`✅ Sell TX Cost: ${costInWei.toString()} wei (${costInEth} ETH)`);
        notification.success(`Sell TX Cost: ${costInEth} ETH`);

        const balanceAfter = await publicClient.getBalance({ address });
        const ethReceived = balanceAfter > balanceBefore ? balanceAfter - balanceBefore : 0n;

        console.log(`💸 ETH Refund: ${ethReceived.toString()} wei (${ethers.formatEther(ethReceived)} ETH)`);
        notification.success(`Received: ${ethers.formatEther(ethReceived)} ETH`);
      }

      await fetchTotalSupply();
      await fetchUserBalance();
    } catch (err: any) {
      console.error("❌ Trade error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {tokenSymbol}/ETH</CardTitle>

        <div className="">
          <CardDescription>{isBuying ? `Buy ${tokenSymbol} using ETH` : `Sell ${tokenSymbol} for ETH`}</CardDescription>
          <Button variant="ghost" onClick={toggleTradeDirection} className="">
            <ArrowDownUp className="h-4 w-4" />
            {isBuying ? `Sell` : `Buy`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input amount */}
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
                {tokenSymbol}
              </Button>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="receive">Cost (estimated)</Label>
            <div className="flex gap-2">
              <Input id="receive" type="text" placeholder="0.0" className="flex-1" value={displayPrice} readOnly />
              <select
                className="w-24 border rounded-md text-sm bg-background text-foreground"
                value={selectedUnit}
                onChange={e => {
                  setSelectedUnit(e.target.value);
                }}
              >
                {FormattedEthUnits.getAllUnits().map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trade Button */}
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

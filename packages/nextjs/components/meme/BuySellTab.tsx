"use client";

import { useState } from "react";
import MemeCoinAbi from "@/abi/MemeCoin.json";
import { EstimatedCost } from "@/components/meme/EstimatedCost";
import { InputAmount } from "@/components/meme/InputAmount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenBalance } from "@/hooks/useTokenBalance";
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
  tokenSymbol: string;
  tokenAddress: string;
}

export const BuySellTab: React.FC<BuySellTabProps> = ({
  isBuying,
  toggleTradeDirection,
  amount,
  setAmount,
  tokenSymbol,
  tokenAddress,
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "LaunchPad" });

  const [isLoading, setIsLoading] = useState(false);
  const [priceOracleWithUnit, setPriceOracleWithUnit] = useState<FormattedEthUnits>(new FormattedEthUnits());

  const { totalSupply, userBalance, refresh: fetchPublicData } = useTokenBalance(tokenAddress);

  const handleTrade = async () => {
    if (!walletClient || !address || !ethers.isAddress(tokenAddress)) return notification.error("Invalid wallet/token");
    if (!publicClient || !address) return;

    try {
      setIsLoading(true);
      const parsedAmount = BigInt(amount);

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

        const txHash = await writeContractAsync({
          functionName: "sell",
          args: [tokenAddress, parsedAmount],
        });

        if (!txHash) throw new Error("No tx hash");
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await fetchPublicData();
    } catch (err) {
      console.error("Trade error:", err);
      notification.error("Trade failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {tokenSymbol}/ETH</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <InputAmount amount={amount} setAmount={setAmount} tokenSymbol={tokenSymbol} />

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
        </div>
      </CardContent>
    </Card>
  );
};

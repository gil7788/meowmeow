"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";

interface BuySellTabProps {
  isBuying: boolean;
  toggleTradeDirection: () => void;
  amount: string;
  setAmount: (val: string) => void;
  receiveAmount: string;
  tokenSymbol: string;
}

export const BuySellTab: React.FC<BuySellTabProps> = ({
  isBuying,
  toggleTradeDirection,
  amount,
  setAmount,
  receiveAmount,
  tokenSymbol,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {tokenSymbol}/ZRC</CardTitle>
        <CardDescription>
          {isBuying ? `Buy ${tokenSymbol} tokens using ZRC` : `Sell ${tokenSymbol} tokens for ZRC`}
        </CardDescription>
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
            <Button className="w-full">Connect Wallet to Trade</Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Price</p>
              <p className="font-medium text-foreground">1 {tokenSymbol} = 0.00023 ZRC</p>
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

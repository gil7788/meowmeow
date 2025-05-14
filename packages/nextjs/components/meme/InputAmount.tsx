"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputAmountProps {
  amount: string;
  setAmount: (val: string) => void;
  tokenSymbol: string;
}

export const InputAmount: React.FC<InputAmountProps> = ({ amount, setAmount, tokenSymbol }) => {
  return (
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
  );
};

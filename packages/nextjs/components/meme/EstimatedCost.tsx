"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormattedEthUnits } from "@/utils/ethUnits";

interface EstimatedCostProps {
  amount: string;
  isBuying: boolean;
  totalSupply: number;
  setPriceOracleWithUnit: (val: FormattedEthUnits) => void;
}

export function EstimatedCost({ amount, isBuying, totalSupply, setPriceOracleWithUnit }: EstimatedCostProps) {
  const [localOracle, setLocalOracle] = useState(new FormattedEthUnits());
  const [selectedUnit, setSelectedUnit] = useState<string>("wei");
  const [displayPrice, setDisplayPrice] = useState("0");

  function getPriceOracle(amount: bigint, totalSupply: bigint, isBuying: boolean): bigint {
    if (!isBuying && totalSupply < amount) return 0n;

    const buyFeeNumerator = 103n;
    const sellFeeNumerator = 97n;
    const feeDenominator = 100n;
    let a = 0n;
    let b = 0n;

    if (isBuying) {
      a = totalSupply + 1n;
      b = totalSupply + amount;
    } else {
      a = totalSupply - amount + 1n;
      b = totalSupply;
    }

    const sumAfter = (b * (b + 1n) * (2n * b + 1n)) / 6n;
    const sumBefore = ((a - 1n) * a * (2n * (a - 1n) + 1n)) / 6n;
    const rawPrice = sumAfter - sumBefore;
    if (isBuying) {
      return (rawPrice * buyFeeNumerator) / feeDenominator + 1n;
    } else {
      return (rawPrice * sellFeeNumerator) / feeDenominator + 1n;
    }
  }

  useEffect(() => {
    try {
      if (!amount || isNaN(Number(amount))) {
        const fallback = new FormattedEthUnits();
        setLocalOracle(fallback);
        setPriceOracleWithUnit(fallback);
        return;
      }

      const parsedAmount = BigInt(amount);
      if (parsedAmount <= 0n) {
        const zero = new FormattedEthUnits();
        setLocalOracle(zero);
        setPriceOracleWithUnit(zero);
        return;
      }

      const rawPrice = getPriceOracle(parsedAmount, BigInt(totalSupply), isBuying);
      const formatted = new FormattedEthUnits(rawPrice);
      setLocalOracle(formatted);
      setPriceOracleWithUnit(formatted);
    } catch {
      const fallback = new FormattedEthUnits();
      setLocalOracle(fallback);
      setPriceOracleWithUnit(fallback);
    }
  }, [amount, isBuying, totalSupply, setPriceOracleWithUnit]);

  useEffect(() => {
    if (!selectedUnit || !localOracle?.valueInAllUnits?.[selectedUnit]) return;
    setDisplayPrice(localOracle.valueInAllUnits[selectedUnit]);
  }, [selectedUnit, localOracle]);

  return (
    <div className="space-y-2">
      <Label htmlFor="receive">Cost (estimated)</Label>
      <div className="flex gap-2">
        <Input id="receive" type="text" className="flex-1" value={displayPrice} readOnly />
        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="w-24 font-bold text-foreground border border-border shadow-md justify-center rounded-md">
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            className="bg-white text-foreground border border-border shadow-md z-50 rounded-md"
            position="popper"
            sideOffset={4}
          >
            {FormattedEthUnits.getAllUnits().map(unit => (
              <SelectItem
                key={unit}
                value={unit}
                className="font-bold text-center hover:bg-yellow-400 focus:bg-yellow-400 focus:text-black"
              >
                {unit.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

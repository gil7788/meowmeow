"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isUnitManuallySelected, setIsUnitManuallySelected] = useState(false);

  function getPriceOracle(amount: bigint, totalSupply: bigint, isBuying: boolean): bigint {
    if (!isBuying && totalSupply <= amount) return 0n;

    const feeNumerator = 110n;
    const feeDenominator = 100n;
    let rawPrice = 0n;
    let price = 0n;

    if (isBuying) {
      for (let i = totalSupply + 1n; i <= totalSupply + amount; i++) rawPrice += i * i;
      price = (rawPrice * feeNumerator) / feeDenominator + 1n;
    } else {
      for (let i = totalSupply; i > totalSupply - amount; i--) rawPrice += i * i;
      price = (rawPrice * feeNumerator) / feeDenominator - 1n;
    }
    return price;
  }

  // When amount or other inputs change → recompute the oracle and push to parent
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
      console.log(formatted.toString());
      setLocalOracle(formatted);
      setPriceOracleWithUnit(formatted);
      const unitFormatted = localOracle.valueInAllUnits[selectedUnit];
      setDisplayPrice(unitFormatted);
    } catch {
      const fallback = new FormattedEthUnits();
      setLocalOracle(fallback);
      setPriceOracleWithUnit(fallback);
    }
  }, [amount, isBuying, totalSupply]);

  // Update display when unit or oracle changes
  useEffect(() => {
    const unitFormatted = localOracle.valueInAllUnits[selectedUnit];
    setDisplayPrice(unitFormatted);
  }, [localOracle, selectedUnit]);

  // Automatically update selected unit unless user changed it manually
//   useEffect(() => {
//     if (!isUnitManuallySelected) {
//         setSelectedUnit(localOracle.getClosestUnit());
//     }
//   }, [localOracle]);

  return (
    <div className="space-y-2">
      <Label htmlFor="receive">Cost (estimated)</Label>
      <div className="flex gap-2">
        <Input id="receive" type="text" className="flex-1" value={displayPrice} readOnly />
        <select
          className="w-24 border rounded-md text-sm bg-background text-foreground"
          value={selectedUnit}
          onChange={e => {
            setIsUnitManuallySelected(true);
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
  );
}

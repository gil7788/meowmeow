export type UnitInfo = {
  name: string;
  exponent: number;
};

export const UNITS: Record<string, UnitInfo> = {
  wei: { name: "wei", exponent: 0 },
  kwei: { name: "kwei", exponent: 3 },
  mwei: { name: "mwei", exponent: 6 },
  gwei: { name: "gwei", exponent: 9 },
  microether: { name: "microether", exponent: 12 },
  milliether: { name: "milliether", exponent: 15 },
  eth: { name: "ETH", exponent: 18 },
};

export const ORDERED_UNITS = Object.entries(UNITS).sort((a, b) => a[1].exponent - b[1].exponent);

function convertUnits(inputValue: bigint, inputUnit: keyof typeof UNITS): Record<string, string> {
  const inputExp = UNITS[inputUnit].exponent;
  const result: Record<string, string> = {};

  for (const [unit, info] of Object.entries(UNITS)) {
    const deltaExp = inputExp - info.exponent;

    if (deltaExp >= 0) {
      const converted = inputValue * 10n ** BigInt(deltaExp);
      result[unit] = converted.toString();
    } else {
      const divisor = 10n ** BigInt(-deltaExp);
      const value = Number(inputValue) / Number(divisor);
      result[unit] = value.toFixed(18).replace(/\.?0+$/, "");
    }
  }

  return result;
}

export class FormattedEthUnits {
  value: bigint;
  valueInAllUnits: Record<string, string>;

  // Declare overloads
  constructor();
  constructor(rawValue: bigint, inputUnitName?: string);

  // Unified implementation
  constructor(rawValue?: bigint, inputUnitName?: string) {
    const value = rawValue ?? 0n;
    const unitKey = inputUnitName ? this.findUnitKeyByName(inputUnitName) : "wei";

    this.value = value;
    this.valueInAllUnits = convertUnits(value, unitKey);
  }

  private findUnitKeyByName(inputUnitName: string): keyof typeof UNITS {
    for (const [key, unitInfo] of Object.entries(UNITS)) {
      if (unitInfo.name.toLowerCase() === inputUnitName.toLowerCase()) {
        return key as keyof typeof UNITS;
      }
    }
    throw new Error("Unit name not found");
  }

  getWeiPrice(): bigint {
    return BigInt(this.valueInAllUnits["wei"]);
  }

  toString(): string {
    return `FormattedEthUnits {\n  valueInAllUnits: ${JSON.stringify(this.valueInAllUnits, null, 2)}\n}`;
  }

  static getAllUnits(): string[] {
    return Object.keys(UNITS);
  }

  getClosestUnit(): string {
    for (const [unit, val] of Object.entries(this.valueInAllUnits)) {
      const num = parseFloat(val);
      if (num >= 1 && num < 1000) {
        return `${val} ${unit}`;
      }
    }
    const [fallbackUnit] = Object.entries(this.valueInAllUnits)[0];
    return `${this.valueInAllUnits[fallbackUnit]} ${fallbackUnit}`;
  }
}

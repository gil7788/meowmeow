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
  
  export const ORDERED_UNITS = Object.entries(UNITS).sort(
    (a, b) => a[1].exponent - b[1].exponent,
  );
  
  function convertUnits(
    inputValue: bigint,
    inputUnit: keyof typeof UNITS,
  ): Record<string, string> {
    const inputExp = UNITS[inputUnit].exponent;
    const result: Record<string, string> = {};
  
    for (const [unit, info] of Object.entries(UNITS)) {
      const deltaExp = inputExp - info.exponent;
  
      if (deltaExp >= 0) {
        // Smaller or equal unit: integer scaling
        const converted = inputValue * 10n ** BigInt(deltaExp);
        result[unit] = converted.toString();
      } else {
        // Larger unit: use float with up to 18 decimal places
        const divisor = 10n ** BigInt(-deltaExp);
        const value = Number(inputValue) / Number(divisor);
        result[unit] = value.toFixed(18).replace(/\.?0+$/, ""); // Trim trailing zeros
      }
    }
  
    return result;
  }
  
  
  export class FormattedEthUnits {
    value: bigint;
    unit: string;
    name: string;
    exponent: number;
    private baseWei: bigint;
    valueInAllUnits: Record<string, string>;
  
    constructor();
    constructor(rawValue: number | bigint);
    constructor(rawValue: number | bigint, inputUnit: string);
    constructor(rawValue: number | bigint, inputUnit: UnitInfo);
    constructor(rawValue?: number | bigint, inputUnit?: string | UnitInfo) {
      if (
        rawValue === undefined ||
        (typeof rawValue === "number" && rawValue === 0) ||
        (typeof rawValue === "bigint" && rawValue === 0n)
      ) {
        this.value = 0n;
        this.unit = "wei";
        this.name = "wei";
        this.exponent = 0;
        this.baseWei = 0n;
        this.valueInAllUnits = convertUnits(0n, "wei");
        return;
      }
  
      let unitInfo: UnitInfo | undefined;
      let unitKey: string;
  
      if (typeof inputUnit === "string" || inputUnit === undefined) {
        unitKey = (inputUnit ?? "wei").toLowerCase();
        unitInfo = UNITS[unitKey];
      } else {
        unitInfo = inputUnit;
        unitKey =
          Object.entries(UNITS).find(
            ([_, info]) => info.exponent === inputUnit.exponent,
          )?.[0] ?? "wei";
      }
  
      if (!unitInfo) {
        throw new Error(`Unknown unit: ${inputUnit}`);
      }
  
      const rawBigInt = BigInt(rawValue!);
      this.baseWei = rawBigInt * 10n ** BigInt(unitInfo.exponent);
  
      for (let i = ORDERED_UNITS.length - 1; i >= 0; i--) {
        const [key, info] = ORDERED_UNITS[i];
        const divisor = 10n ** BigInt(info.exponent);
        if (this.baseWei >= divisor) {
          this.value = this.baseWei / divisor;
          this.unit = key;
          this.name = info.name;
          this.exponent = info.exponent;
          this.valueInAllUnits = convertUnits(this.baseWei, key as keyof typeof UNITS);
          return;
        }
      }
  
      const [key, info] = ORDERED_UNITS[0];
      this.value = this.baseWei;
      this.unit = key;
      this.name = info.name;
      this.exponent = info.exponent;
      this.valueInAllUnits = convertUnits(this.baseWei, key as keyof typeof UNITS);
    }
  
    getWeiPrice(): bigint {
      return this.baseWei;
    }
  
    toString(): string {
        return `
      FormattedEthUnits {
        value: ${this.value.toString()},
        unit: ${this.unit},
        name: ${this.name},
        exponent: ${this.exponent},
        baseWei: ${this.baseWei.toString()},
        valueInAllUnits: ${JSON.stringify(this.valueInAllUnits, null, 2)}
      }`.trim();
      }
      
  
    static getAllUnits(): string[] {
      return Object.keys(UNITS);
    }

    getClosestUnit(): string {
        for (let i = ORDERED_UNITS.length - 1; i >= 0; i--) {
          const [key, info] = ORDERED_UNITS[i];
          const divisor = 10n ** BigInt(info.exponent);
          const value = Number(this.baseWei) / Number(divisor);
      
          // Clamp to eth if value >= 1000 eth
          if (key === "eth" && value >= 1000) {
            return key;
          }
      
          if (value >= 1 && value < 1000) {
            return key;
          }
        }
      
        // Fallback to smallest unit
        const [fallbackKey] = ORDERED_UNITS[0];
        return fallbackKey;
      }     
      
  }


  // getPriceByUnit(unitName: string): FormattedEthUnits {
    //   const unit = UNITS[unitName.toLowerCase()];
    //   if (!unit) throw new Error(`Unknown unit: ${unitName}`);
    //   return new FormattedEthUnits(this.baseWei, unit);
    // }
  
    // get unitPrices(): Record<string, string> {
    //   const dict: Record<string, string> = {};
  
    //   for (const [unitKey, unitInfo] of Object.entries(UNITS)) {
    //     const divisor = 10n ** BigInt(unitInfo.exponent);
    //     const value = Number(this.baseWei) / 10 ** unitInfo.exponent;
    //     dict[unitKey] = value.toFixed(6);
    //   }
  
    //   return dict;
    // }
  
    // toFixed(decimals: number = 6): string {
    //   return (Number(this.value) / 1).toFixed(decimals);
    // }
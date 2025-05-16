"use client";

import { ethers } from "ethers";

interface TokenBalanceProps {
  totalSupply: number;
  userBalance: bigint;
  tokenSymbol: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ totalSupply, userBalance, tokenSymbol }) => {
  return (
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
  );
};

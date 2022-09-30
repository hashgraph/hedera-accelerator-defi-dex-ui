import React, { useState } from "react";
import { BigNumber } from "bignumber.js";

import { swapTokenA, swapTokenB, addLiquidity, getTokenBalance } from "./swapContract";

export interface TokenBalance {
  tokenA?: BigNumber;
  tokenB?: BigNumber;
}

export interface HederaServiceContextProps {
  balance: TokenBalance;
  getBalance: () => void;
  swapTokenAWithB: () => void;
  swapTokenBWithA: () => void;
  addLiquidityToPool: () => void;
}

const HederaServiceContext = React.createContext<HederaServiceContextProps>({
  balance: { tokenA: new BigNumber(0), tokenB: new BigNumber(0) },
  getBalance: () => null,
  swapTokenAWithB: () => null,
  swapTokenBWithA: () => null,
  addLiquidityToPool: () => null,
});

export interface HederaServiceProviderProps {
  children?: React.ReactNode;
}
/*
 * This hook is currently for testing purposes only.
 */
const HederaServiceProvider = ({ children }: HederaServiceProviderProps) => {
  const [balance, setBalance] = useState<TokenBalance>({ tokenA: new BigNumber(0), tokenB: new BigNumber(0) });
  const getBalance = async () => {
    console.log("Balance query sent...");
    const balane = await getTokenBalance();
    console.log(`Balance query received...${balane}`);
    setBalance({ tokenA: balane.tokenAQty, tokenB: balane.tokenBQty });
  };

  const swapTokenAWithB = async () => {
    console.log("swapTokenA sent...");
    const balane = await swapTokenA();
    console.log(`swapTokenA received...${balane}`);
  };

  const swapTokenBWithA = async () => {
    console.log("swapTokenB sent...");
    const balane = await swapTokenB();
    console.log(`swapTokenB received...${balane}`);
  };

  const addLiquidityToPool = async () => {
    console.log("addLiquidity sent...");
    const balane = await addLiquidity();
    console.log(`addLiquidity received...${balane}`);
  };

  return (
    <HederaServiceContext.Provider
      value={{
        balance,
        getBalance,
        swapTokenAWithB,
        swapTokenBWithA,
        addLiquidityToPool,
      }}
    >
      {children}
    </HederaServiceContext.Provider>
  );
};

export { HederaServiceContext, HederaServiceProvider };
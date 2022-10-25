import { TokenBalanceJson } from "@hashgraph/sdk/lib/account/AccountBalance";
import { BigNumber } from "bignumber.js";
import { WALLET_LOCAL_DATA_KEY } from "../../services/constants";

const getLocalWalletData = (): any => {
  const localWalletData = localStorage.getItem(WALLET_LOCAL_DATA_KEY);

  if (localWalletData === null) {
    return null;
  }

  try {
    const walletData = JSON.parse(localWalletData);
    return walletData;
  } catch (parseError) {
    console.error(parseError);
    return null;
  }
};

const getFormattedTokenBalances = (tokenBalances: TokenBalanceJson[]) => {
  return tokenBalances.map((tokenBalanceJson) => {
    const { tokenId, balance, decimals } = tokenBalanceJson;
    if (decimals === 0) {
      return { ...tokenBalanceJson };
    }
    return { tokenId, balance: BigNumber(balance).shiftedBy(-decimals).toString(), decimals };
  });
};

export { getLocalWalletData, getFormattedTokenBalances };

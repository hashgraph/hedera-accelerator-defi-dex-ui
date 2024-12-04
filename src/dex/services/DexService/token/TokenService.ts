import { BigNumber } from "bignumber.js";
import { DexService } from "../..";
import { MirrorNodeAccountBalance } from "../../../../shared/services/MirrorNodeService";
import { DEX_TOKEN_PRECISION_VALUE } from "../../constants";

/**
 * Fetches the HBAR balance and a list of token balances on the Hedera
 * network for the given account ID. Fetches the decimal precision value for
 * each token ID and formats the balances with the correct decimal positions.
 * @param accountId - The ID of the account to return token balances for.
 * @returns The list of balances (in decimal format) for the given account ID.
 */
export async function fetchAccountTokenBalances(accountId: string): Promise<MirrorNodeAccountBalance> {
  const accountBalances = await DexService.fetchAccountBalances(accountId);
  const tokens = await DexService.fetchTokensBalance(accountId);
  const account = accountBalances.filter((accountDetails) => accountDetails.account === accountId)[0];
  const tokenBalances = await Promise.all(
    tokens.map(async (token) => {
      const tokenData = await DexService.fetchTokenData(token.token_id);
      const { decimals, symbol, name, type } = tokenData.data;
      const balance = BigNumber(token.balance).shiftedBy(-Number(decimals));
      return {
        ...token,
        balance,
        decimals: String(decimals),
        symbol,
        name,
        type,
      };
    })
  );
  return {
    account: accountId,
    tokens: tokenBalances,
    balance: BigNumber(account.balance).shiftedBy(-DEX_TOKEN_PRECISION_VALUE),
  };
}

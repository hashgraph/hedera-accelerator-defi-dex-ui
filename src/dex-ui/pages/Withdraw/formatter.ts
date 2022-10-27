import { A_B_PAIR_TOKEN_ID, TOKEN_ID_TO_TOKEN_SYMBOL } from "../../services";
import { PoolsStore, UserPool } from "../../store/poolsSlice";
import { formatBigNumberToPercent } from "../../utils";

/**
 * Formats raw PoolsStore data into numbers and percents for WithdrawComponent to display
 * @param pools - PoolsStore from pools fetch
 * @param selectedPoolMetrics - specific UserPool to be withdrawn from
 * @returns details of pool and associated tokens to be fed into WithdrawComponent as props
 */
export function formatWithdrawDataPoints(pools: PoolsStore, selectedPoolMetrics: UserPool) {
  const { poolTokenBalances, userTokenBalances } = pools;
  const [firstTokenBalance, secondTokenBalance] = poolTokenBalances;

  // user provided liquidity as percent of pool in number and percent format
  const userPercentOfPool = selectedPoolMetrics.percentOfPool;
  const userPercentOfPoolAsNumber = userPercentOfPool.toNumber();
  const userPercentOfPoolAsPercent = formatBigNumberToPercent(userPercentOfPool);
  const userLpAmount = userTokenBalances.find((token) => token.token_id === A_B_PAIR_TOKEN_ID)?.balance.toNumber() || 0;

  // details of first token
  const firstTokenSymbol = TOKEN_ID_TO_TOKEN_SYMBOL.get(firstTokenBalance.token_id) || "";
  const firstTokenPoolLiquidity = firstTokenBalance.balance.toNumber();
  const firstTokenUserProvidedLiquidity = userPercentOfPoolAsNumber * firstTokenPoolLiquidity;

  // details of first token
  const secondTokenSymbol = TOKEN_ID_TO_TOKEN_SYMBOL.get(secondTokenBalance.token_id) || "";
  const secondTokenPoolLiquidity = secondTokenBalance.balance.toNumber();
  const secondTokenUserProvidedLiquidity = userPercentOfPoolAsNumber * secondTokenPoolLiquidity;

  const firstToken = {
    tokenSymbol: firstTokenSymbol,
    poolLiquidity: firstTokenPoolLiquidity,
    userProvidedLiquidity: firstTokenUserProvidedLiquidity,
  };
  const secondToken = {
    tokenSymbol: secondTokenSymbol,
    poolLiquidity: secondTokenPoolLiquidity,
    userProvidedLiquidity: secondTokenUserProvidedLiquidity,
  };
  const poolLpDetails = {
    tokenSymbol: selectedPoolMetrics.name,
    userLpAmount,
    userLpPercentage: userPercentOfPoolAsPercent,
  };

  return { firstToken, secondToken, poolLpDetails };
}

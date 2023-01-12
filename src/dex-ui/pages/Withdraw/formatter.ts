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

  const pairAccountId = selectedPoolMetrics?.userTokenPair?.tokenA.tokenMeta.pairAccountId ?? "";
  const lpAccountId = selectedPoolMetrics?.userTokenPair?.pairToken.pairLpAccountId ?? "";
  const token = poolTokenBalances.find((pool) => pool.account === pairAccountId);
  const [firstTokenBalance, secondTokenBalance] = token?.tokens ?? [];
  // user provided liquidity as percent of pool in number and percent format
  const userPercentOfPool = selectedPoolMetrics.percentOfPool;
  const userPercentOfPoolAsNumber = userPercentOfPool.toNumber();
  const userPercentOfPoolAsPercent = formatBigNumberToPercent(userPercentOfPool);
  const userLpAmount =
    userTokenBalances?.tokens.find((token) => token.token_id === lpAccountId)?.balance.toNumber() || 0;

  // details of first token
  const firstTokenSymbol = selectedPoolMetrics.userTokenPair?.tokenA.symbol ?? "";
  const firstTokenPoolLiquidity = firstTokenBalance?.balance.toNumber() ?? 0;
  const firstTokenUserProvidedLiquidity = userPercentOfPoolAsNumber * firstTokenPoolLiquidity;

  // details of Second token
  const secondTokenSymbol = selectedPoolMetrics.userTokenPair?.tokenB.symbol ?? "";
  const secondTokenPoolLiquidity = secondTokenBalance?.balance.toNumber() ?? 0;
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
    pairAccountId,
    lpAccountId,
  };

  return { firstToken, secondToken, poolLpDetails };
}

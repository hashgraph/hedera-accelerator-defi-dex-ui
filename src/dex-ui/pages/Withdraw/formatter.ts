import { HBARTokenSymbol } from "../../services";
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
  const pairAccount = poolTokenBalances.find((pool) => pool.account === pairAccountId);
  const [firstPairToken, secondPairToken] = pairAccount?.tokens ?? [];

  const isHBARTokenPair = pairAccount?.tokens.length === 1;

  const userPercentOfPool = selectedPoolMetrics.percentOfPool;
  const userPercentOfPoolAsNumber = userPercentOfPool.toNumber();
  const userPercentOfPoolAsPercent = formatBigNumberToPercent(userPercentOfPool);
  const userLpAmount =
    userTokenBalances?.tokens.find((token) => token.token_id === lpAccountId)?.balance.toNumber() || 0;

  const firstTokenSymbol = selectedPoolMetrics.userTokenPair?.tokenA.symbol ?? "";
  const firstTokenPoolLiquidity = isHBARTokenPair && firstTokenSymbol === HBARTokenSymbol
    ? pairAccount?.balance.toNumber() ?? 0
    : firstPairToken?.balance.toNumber() ?? 0;
  const firstTokenUserProvidedLiquidity = userPercentOfPoolAsNumber * (firstTokenPoolLiquidity ?? 0);

  const secondTokenSymbol = selectedPoolMetrics.userTokenPair?.tokenB.symbol ?? "";
  const secondTokenPoolLiquidity = isHBARTokenPair
    ? (secondTokenSymbol === HBARTokenSymbol ? pairAccount.balance.toNumber() : firstPairToken?.balance.toNumber())
    : secondPairToken?.balance.toNumber() ?? 0;
  const secondTokenUserProvidedLiquidity = userPercentOfPoolAsNumber * (secondTokenPoolLiquidity ?? 0);

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

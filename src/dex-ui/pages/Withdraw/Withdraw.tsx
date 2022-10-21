import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WithdrawComponent } from "../../../dex-ui-components/Pool";
import { useDexContext } from "../../hooks";
import { TOKEN_ID_TO_TOKEN_SYMBOL } from "../../services";

const Withdraw = () => {
  const [pools, wallet] = useDexContext(({ pools, wallet }) => [pools, wallet]);
  const walletAccountId = wallet.walletData.pairedAccounts[0];

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [withdrawState, setWithdrawState] = useState({
    noPoolMetricsMessage: "Loading... TODO: replace this?",
    withdrawProps: {
      walletConnectionStatus: wallet.walletConnectionStatus,
      poolLiquidityDetails: {
        firstToken: {
          tokenSymbol: "",
          poolLiquidity: 0,
          userProvidedLiquidity: 0,
        },
        secondToken: {
          tokenSymbol: "",
          poolLiquidity: 0,
          userProvidedLiquidity: 0,
        },
      },
      poolLpDetails: {
        tokenSymbol: "",
        poolLiquidity: 0,
        userLpAmount: 0,
        userLpPercentage: 0,
      },
    },
    lpInputAmount: 0,
  });

  useEffect(() => {
    /**
     * Generally this page will be routed to from the My Pools table.
     * If the URL for this page is hit directly, there is a good chance
     * the data for pools store has not yet been fetched. In this case
     * we want to fetch the pool metrics here
     *
     * However, if there is no specified pool (in query param of URL)
     * then we want to redirect them back to the My Pools page as there
     * isn't a pool specified to withdraw from
     */

    // When routing from My Pools, slashes are replaced with dashes
    // in order to prevent issues with the URL. Replacing back here
    const queryParam = searchParams.get("pool")?.replace("-", "/");
    if (queryParam) {
      if (pools.status === "init" || pools.status === "error") {
        // fetch the user pool metrics if they haven't already
        const fetchUserPoolMetrics = async () => {
          await pools.fetchAllPoolMetrics();
          await pools.fetchUserPoolMetrics(walletAccountId);
          // console.log('fetching', pools);
          // setWithdrawComponentProps(queryParam);
          // TODO: investigate async behavior
        };
        setTimeout(fetchUserPoolMetrics, 0);
      } else if (pools.status === "fetching") {
        setWithdrawState({
          ...withdrawState,
          noPoolMetricsMessage: "Loading... TODO: replace this?",
        });
      } else {
        if (pools.userPoolsMetrics.length > 0) {
          setWithdrawComponentProps(queryParam);
        } else {
          setWithdrawState({
            ...withdrawState,
            noPoolMetricsMessage: "User has no pools",
          });
        }
      }
    } else {
      // no pool indicated, so redirect to My Pools page
      navigate("/pool");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools]);

  /**
   * Returns the user pool metrics for a given LP token, using token symbol/name as reference key
   * @param tokenSymbol - LP token symbol/name
   * @returns the corresponding pool metric for the given symbol. If none is found, returns undefined
   */
  const findPoolByLpToken = useCallback(
    (tokenSymbol: string) => {
      return (
        pools.userPoolsMetrics.length > 0 &&
        pools.userPoolsMetrics.find((poolMetric) => poolMetric.name === tokenSymbol)
      );
    },
    [pools.userPoolsMetrics]
  );

  /**
   * Uses tokenSymbol from query parameter to find the corresponding user pool metric.
   * Along with poolTokenBalances and userTokenBalances, props for WithdrawComponent are built here
   */
  const setWithdrawComponentProps = useCallback(
    (tokenSymbol: string) => {
      const selectedPoolMetrics = findPoolByLpToken(tokenSymbol);
      if (selectedPoolMetrics) {
        // TODO: need to fetch token symbols from specific contract
        const { poolTokenBalances, userTokenBalances } = pools;
        const [firstTokenBalance, secondTokenBalance, lpTokenBalance] = poolTokenBalances;
        const firstToken = {
          tokenSymbol: TOKEN_ID_TO_TOKEN_SYMBOL.get(firstTokenBalance.token_id) || "",
          poolLiquidity: firstTokenBalance.balance,
          userProvidedLiquidity: (selectedPoolMetrics.liquidity / 100) * firstTokenBalance.balance,
        };
        const secondToken = {
          tokenSymbol: TOKEN_ID_TO_TOKEN_SYMBOL.get(secondTokenBalance.token_id) || "",
          poolLiquidity: secondTokenBalance.balance,
          userProvidedLiquidity: (selectedPoolMetrics.liquidity / 100) * secondTokenBalance.balance,
        };
        const poolLpDetails = {
          tokenSymbol: selectedPoolMetrics.name,
          poolLiquidity: lpTokenBalance.balance,
          userLpAmount: userTokenBalances.find((bal) => bal.token_id === lpTokenBalance.token_id)?.balance || 0,
          userLpPercentage: selectedPoolMetrics.liquidity,
        };

        setWithdrawState({
          ...withdrawState,
          noPoolMetricsMessage: "",
          withdrawProps: {
            ...withdrawState.withdrawProps,
            poolLiquidityDetails: {
              firstToken,
              secondToken,
            },
            poolLpDetails,
          },
        });
      } else {
        // no user pool metrics found
        setWithdrawState({
          ...withdrawState,
          noPoolMetricsMessage: `No pool metrics found for LP token: ${tokenSymbol}`,
        });
      }
    },
    [findPoolByLpToken, pools, withdrawState]
  );

  const onWithdrawClick = useCallback(
    (lpAmount: number) => {
      console.log(lpAmount);
      pools.sendRemoveLiquidityTransaction(lpAmount);
    },
    [pools]
  );

  const onInputAmountChange = useCallback(
    (lpAmount: number) => {
      setWithdrawState({
        ...withdrawState,
        lpInputAmount: lpAmount,
      });
    },
    [withdrawState]
  );

  return !withdrawState.noPoolMetricsMessage ? (
    <WithdrawComponent
      {...withdrawState.withdrawProps}
      onWithdrawClick={onWithdrawClick}
      onInputAmountChange={onInputAmountChange}
      disableWithdrawButton={withdrawState.lpInputAmount === 0}
    />
  ) : (
    <>{withdrawState.noPoolMetricsMessage}</>
  );
};

export { Withdraw };

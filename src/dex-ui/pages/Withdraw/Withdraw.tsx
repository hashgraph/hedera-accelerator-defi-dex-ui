import { WarningIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadingDialog } from "../../../dex-ui-components";
import { WithdrawComponent } from "../../../dex-ui-components/Pool";
import { useDexContext } from "../../hooks";
import { formatWithdrawDataPoints } from "./formatter";

const Withdraw = () => {
  const [pools, wallet] = useDexContext(({ pools, wallet }) => [pools, wallet]);
  const walletAccountId = wallet.walletData.pairedAccounts[0];

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [withdrawState, setWithdrawState] = useState({
    noPoolMetricsMessage: "Loading... TODO: replace this?",
    errorDialogOpen: false,
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
        userLpAmount: 0,
        userLpPercentage: "0%",
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
      navigate("/pool?selectedPools=user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools]);

  /**
   * Effect for listening to the state of withdraw transaction.
   * When transaction is waiting on signature/in progress we want to show a loading dialog. (handled in template)
   * When transaction fails we want to show a failure dialog.
   * When transaction succeeds we want to route the user to the My Pools table with a success message
   */
  useEffect(() => {
    setWithdrawState((state) => ({
      ...state,
      errorDialogOpen: pools.withdrawState.status === "error",
    }));

    if (pools.withdrawState.status === "success") {
      navigate("/pool?selectedPools=user&withdrawSuccessful=true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools.withdrawState]);

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
        const { firstToken, secondToken, poolLpDetails } = formatWithdrawDataPoints(pools, selectedPoolMetrics);

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
      const { tokenSymbol, userLpPercentage } = withdrawState.withdrawProps.poolLpDetails;
      pools.sendRemoveLiquidityTransaction(tokenSymbol, lpAmount, userLpPercentage);
    },
    [pools, withdrawState]
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
    <>
      <WithdrawComponent
        {...withdrawState.withdrawProps}
        onWithdrawClick={onWithdrawClick}
        onInputAmountChange={onInputAmountChange}
        disableWithdrawButton={withdrawState.lpInputAmount === 0}
      />
      <LoadingDialog
        isOpen={pools.withdrawState.status === "in progress"}
        message={"Please confirm the swap in your wallet to proceed"}
      />
      <LoadingDialog
        isOpen={pools.withdrawState.status === "error" && withdrawState.errorDialogOpen}
        message={pools.withdrawState.errorMessage ?? ""}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => setWithdrawState({ ...withdrawState, errorDialogOpen: false }),
        }}
      />
    </>
  ) : (
    <>{withdrawState.noPoolMetricsMessage}</>
  );
};

export { Withdraw };

import { Box, HStack, Flex, Center } from "@chakra-ui/react";
import { useDexContext, usePoolsData } from "../../hooks";
import { WithdrawForm } from "../../../dex-ui-components/presets/WithdrawForm/WithdrawForm";
import { useSearchParams, useNavigate } from "react-router-dom";
import { REFRESH_INTERVAL } from "../../hooks/constants";
import { formatWithdrawDataPoints } from "./formatter";
import { findPoolByLpToken } from "./utils";
import { UserPool } from "../../store/poolsSlice";
import { PoolsLocationProps } from "../Pools";
import { useEffect, useState } from "react";

export function WithdrawPage() {
  const { app, wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));
  usePoolsData(REFRESH_INTERVAL);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("pool") ?? "";

  const [withdrawState, setWithDrawState] = useState(() => {
    const selectedPoolMetrics = findPoolByLpToken(queryParam, pools.userPoolsMetrics) as UserPool;
    const { firstToken, secondToken, poolLpDetails } = formatWithdrawDataPoints(pools, selectedPoolMetrics);
    return { firstToken, secondToken, poolLpDetails };
  });

  useEffect(() => {
    if (pools.withdrawTransactionState.status === "success") {
      navigate("/pools", { state: { withdrawSuccessful: true, selectedTab: 1 } as PoolsLocationProps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools.withdrawTransactionState]);

  useEffect(() => {
    if (queryParam) {
      const selectedPoolMetrics = findPoolByLpToken(queryParam, pools.userPoolsMetrics) as UserPool;
      const { firstToken, secondToken, poolLpDetails } = formatWithdrawDataPoints(pools, selectedPoolMetrics);
      setWithDrawState({ firstToken, secondToken, poolLpDetails });
    } else {
      navigate("/pools", { state: { withdrawSuccessful: false, selectedTab: 0 } as PoolsLocationProps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools]);

  const isFormLoading =
    app.isFeatureLoading("pairedAccountBalance") ||
    app.isFeatureLoading("userPoolsMetrics") ||
    app.isFeatureLoading("allPoolsMetrics");

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
            <WithdrawForm
              pairedAccountBalance={wallet.pairedAccountBalance}
              isLoading={isFormLoading}
              poolLpDetails={withdrawState.poolLpDetails}
              poolLiquidityDetails={{ firstToken: withdrawState.firstToken, secondToken: withdrawState.secondToken }}
              transactionState={pools.withdrawTransactionState}
              connectionStatus={wallet.hashConnectConnectionState}
              connectToWallet={wallet.connectToWallet}
              sendWithdrawTransaction={pools.sendRemoveLiquidityTransaction}
              resetWithdrawState={pools.resetWithdrawState}
            />
          </Flex>
        </Center>
      </Box>
    </HStack>
  );
}

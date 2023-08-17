import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "../Swap/formatters";
import { AddLiquidityForm } from "../../../shared/ui-kit";
import { Page, DefiFormContainer } from "../../layouts";
import { useParams } from "react-router-dom";

export function AddLiquidityPage() {
  const { app, wallet, swap, pools } = useDexContext(({ app, wallet, swap, pools }) => ({ app, wallet, swap, pools }));
  const { pairInfo, poolLiquidity } = swap;
  const { formattedSpotPrices } = formatSwapPageData({
    spotPrices: pairInfo.spotPrices,
    poolLiquidity,
  });

  const { pairId, poolName } = useParams();

  const isFormLoading =
    app.isFeatureLoading("pairInfo") ||
    app.isFeatureLoading("pairedAccountBalance") ||
    app.isFeatureLoading("tokenPairs");

  return (
    <Page
      body={
        <DefiFormContainer>
          <AddLiquidityForm
            isLoading={isFormLoading}
            selectedFromPoolPairId={pairId}
            poolName={poolName}
            pairedAccountBalance={wallet.pairedAccountBalance}
            tokenPairs={swap.tokenPairs}
            spotPrices={formattedSpotPrices}
            userPoolsMetrics={pools.userPoolsMetrics}
            transactionState={pools.addLiquidityTransactionState}
            connectionStatus={wallet.hashConnectConnectionState}
            connectToWallet={wallet.connectToWallet}
            fetchPairInfo={swap.fetchPairInfo}
            sendAddLiquidityTransaction={pools.sendAddLiquidityTransaction}
            resetAddLiquidityState={pools.resetAddLiquidityState}
          />
        </DefiFormContainer>
      }
    />
  );
}

import { SwapTokensForm } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "./formatters";
import { GetTokensButton } from "../../components";
import { Page, DefiFormContainer } from "../../layouts";

export function SwapPage() {
  const [app, wallet, swap] = useDexContext(({ app, wallet, swap }) => [app, wallet, swap]);
  const { pairInfo, poolLiquidity } = swap;
  const { formattedSpotPrices, formattedPoolLiquidity, formattedFee } = formatSwapPageData({
    spotPrices: pairInfo.spotPrices,
    fee: pairInfo.fee,
    poolLiquidity,
  });

  const isFormLoading =
    app.isFeatureLoading("tokenPairs") ||
    app.isFeatureLoading("pairedAccountBalance") ||
    app.isFeatureLoading("pairInfo");

  return (
    <Page
      body={
        <DefiFormContainer>
          <SwapTokensForm
            pairedAccountBalance={wallet.pairedAccountBalance}
            tokenPairs={swap.tokenPairs}
            spotPrices={formattedSpotPrices}
            poolLiquidity={formattedPoolLiquidity}
            fee={formattedFee}
            isLoading={isFormLoading}
            transactionState={swap.transactionState}
            connectionStatus={wallet.hashConnectConnectionState}
            sendSwapTransaction={swap.sendSwapTransaction}
            getPoolLiquidity={swap.getPoolLiquidity}
            fetchPairInfo={swap.fetchPairInfo}
            connectToWallet={wallet.connectToWallet}
          />
          <GetTokensButton />
        </DefiFormContainer>
      }
    />
  );
}

import { useDexContext } from "../../hooks";
import { CreatePoolForm } from "../../../dex-ui-components";
import { Page, DefiFormContainer } from "../../layouts";

export function CreatePoolPage() {
  const { app, wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));
  const isFormLoading = app.isFeatureLoading("pairedAccountBalance") || app.isFeatureLoading("allPoolsMetrics");

  return (
    <Page
      body={
        <DefiFormContainer>
          <CreatePoolForm
            isLoading={isFormLoading}
            pairedAccountBalance={wallet.pairedAccountBalance}
            tokenPairs={pools.tokenPairs}
            allPoolsMetrics={pools.allPoolsMetrics}
            transactionState={pools.createPoolTransactionState}
            connectionStatus={wallet.hashConnectConnectionState}
            connectToWallet={wallet.connectToWallet}
            sendCreatePoolTransaction={pools.sendCreatePoolTransaction}
            resetCreatePoolState={pools.resetCreatePoolState}
          />
        </DefiFormContainer>
      }
    />
  );
}

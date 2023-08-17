import { useDexContext } from "../../hooks";
import { CreatePoolForm } from "../../../shared/ui-kit";
import { Page, DefiFormContainer } from "../../layouts";
import { useCreatePoolTransactionFee } from "../../hooks";

export function CreatePoolPage() {
  const { app, wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));
  const { data: transactionFee, isLoading } = useCreatePoolTransactionFee();
  const isFormLoading =
    app.isFeatureLoading("pairedAccountBalance") || app.isFeatureLoading("allPoolsMetrics") || isLoading;

  return (
    <Page
      body={
        <DefiFormContainer>
          <CreatePoolForm
            isLoading={isFormLoading}
            transactionFee={transactionFee}
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

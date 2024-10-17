import { HashConnectConnectionState } from "hashconnect/dist/types";
import { WalletConnectionProps } from ".";
import { Color, Notification, NotficationTypes } from "../..";

const getConnectionStatusColor = (connectionState: HashConnectConnectionState, isHbarBalanceZero: boolean): string => {
  if (connectionState === HashConnectConnectionState.Paired) {
    if (isHbarBalanceZero) {
      return Color.Yellow_01;
    } else {
      return Color.Green_01;
    }
  }
  return Color.Red_01;
};

interface GetConnectionStateNotificationParams {
  connectionState: HashConnectConnectionState;
  hashScanAccountLink: string;
  isHbarBalanceZero: boolean;
}

const getConnectionStateNotification = ({
  connectionState,
  hashScanAccountLink,
  isHbarBalanceZero,
}: GetConnectionStateNotificationParams): JSX.Element => {
  if (connectionState === HashConnectConnectionState.Paired && isHbarBalanceZero) {
    return (
      <Notification
        type={NotficationTypes.WARNING}
        textStyle="h4"
        bg={Color.Yellow_01}
        message={"You don’t have any HBAR available. You’ll need HBAR to pay for any gas fees."}
        isLinkShown={true}
        linkText="View in HashScan"
        linkRef={hashScanAccountLink}
      />
    );
  }
  /**
   * TODO: Add condition for when the DEX loses connection with Hashpack due
   * to network issues (not a purposeful disconnection).
   */
  return <></>;
};

export const formatWalletConnectionData = (props: WalletConnectionProps) => {
  const { accountId, connectionState, accountBalances } = props;
  const isHbarBalanceZero =
    accountBalances?.hbars !== undefined && Number(accountBalances?.hbars.replace("ℏ", "")) === 0;
  const hashScanAccountLink = `https://hashscan.io/testnet/account/${accountId}`;

  return {
    hashScanAccountLink,
    formattedTokens: accountBalances?.tokens ?? [],
    formattedHbarAmount:
      accountBalances?.hbars && accountBalances?.hbars !== "0 tℏ"
        ? `${Number(accountBalances.hbars.replace("ℏ", "")).toFixed(6)} ℏ`
        : accountBalances?.hbars === "0 tℏ"
        ? "0 ℏ"
        : "- ℏ",
    connectionNotification: getConnectionStateNotification({ connectionState, hashScanAccountLink, isHbarBalanceZero }),
    connectionStatusColor: getConnectionStatusColor(connectionState, isHbarBalanceZero),
  };
};

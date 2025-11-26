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

  console.log("(formatter) Account balances:", accountBalances);
  console.log("(formatter) HBAR value:", accountBalances?.hbars);

  // Parse HBAR balance - handle formats like "100 ℏ", "0 tℏ", or undefined
  let formattedHbarAmount = "- ℏ";
  if (accountBalances?.hbars) {
    const hbarString = accountBalances.hbars;
    console.log("(formatter) HBAR string before parsing:", hbarString);

    // Remove both "ℏ" and "t" (tinybars indicator), then parse
    const hbarValue = Number(hbarString.replace(/[ℏt\s]/g, ""));
    console.log("(formatter) HBAR value after parsing:", hbarValue);

    if (!isNaN(hbarValue)) {
      formattedHbarAmount = `${hbarValue.toFixed(6)} ℏ`;
    }
  }

  console.log("(formatter) Final formatted HBAR:", formattedHbarAmount);

  const isHbarBalanceZero =
    accountBalances?.hbars !== undefined && Number(accountBalances.hbars.replace(/[ℏt\s]/g, "")) === 0;
  const hashScanAccountLink = `https://hashscan.io/testnet/account/${accountId}`;

  return {
    hashScanAccountLink,
    formattedTokens: accountBalances?.tokens ?? [],
    formattedHbarAmount,
    connectionNotification: getConnectionStateNotification({ connectionState, hashScanAccountLink, isHbarBalanceZero }),
    connectionStatusColor: getConnectionStatusColor(connectionState, isHbarBalanceZero),
  };
};

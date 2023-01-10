import { MessageTypes, HashConnectTypes } from "hashconnect";
import { BigNumber } from "bignumber.js";
import { TokenBalanceJson } from "@hashgraph/sdk/lib/account/AccountBalance";
import { getErrorMessage } from "../../utils";
import { WalletSlice, WalletStore, WalletActionType, WalletState } from "./types";
import { getFormattedTokenBalances } from "./utils";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { WalletService } from "../../services";

const initialWalletState: WalletState = {
  availableExtension: null,
  hashConnectConnectionState: HashConnectConnectionState.Disconnected,
  topicID: "",
  pairingString: "",
  pairedAccountBalance: null,
  savedPairingData: null,
  errorMessage: null,
};

/**
 *
 * @returns
 */
const createWalletSlice: WalletSlice = (set, get): WalletStore => {
  return {
    ...initialWalletState,
    getSigner: () => {
      const { context, wallet } = get();
      const provider = WalletService.getProvider(
        context.network,
        wallet.topicID,
        wallet.savedPairingData?.accountIds[0] ?? ""
      );
      const signer = WalletService.getSigner(provider);
      return signer;
    },
    getTokenAmountWithPrecision: (tokenId: string, tokenAmount: number) => {
      const { wallet } = get();
      const defaultDecimals = 8;
      const tokenData = wallet.pairedAccountBalance?.tokens;
      const decimals =
        tokenData?.find((token: TokenBalanceJson) => token.tokenId === tokenId)?.decimals ?? defaultDecimals;
      return BigNumber(tokenAmount).shiftedBy(decimals).integerValue();
    },
    initializeWalletConnection: async () => {
      set({}, false, WalletActionType.INITIALIZE_WALLET_CONNECTION_STARTED);
      try {
        const { DEXMetaData, network, debug } = get().context;
        const { topic, pairingString, savedPairings } = await WalletService.initWalletConnection(
          DEXMetaData,
          network,
          debug
        );
        console.log({ topic, pairingString, savedPairings });
        set(
          ({ wallet }) => {
            wallet.topicID = topic;
            wallet.pairingString = pairingString;
            wallet.savedPairingData = savedPairings;
          },
          false,
          WalletActionType.INITIALIZE_WALLET_CONNECTION_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ wallet }) => {
            wallet.errorMessage = errorMessage;
          },
          false,
          WalletActionType.INITIALIZE_WALLET_CONNECTION_FAILED
        );
      }
    },
    connectToWallet: () => {
      set({}, false, WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED);
      WalletService.connectToWalletExtension();
      set({}, false, WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED);
    },
    disconnectWallet: async () => {
      set({}, false, WalletActionType.DISCONNECT_WALLET_STARTED);
      const { wallet } = get();
      try {
        await WalletService.disconnect(wallet.topicID);
        set({}, false, WalletActionType.DISCONNECT_WALLET_SUCCEEDED);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ wallet }) => {
            wallet.errorMessage = errorMessage;
          },
          false,
          WalletActionType.DISCONNECT_WALLET_FAILED
        );
      }
    },
    fetchAccountBalance: async () => {
      set({}, false, WalletActionType.FETCH_ACCOUNT_BALANCE_STARTED);
      const { context, app, wallet } = get();
      app.setFeaturesAsLoading(["pairedAccountBalance"]);
      try {
        const provider = WalletService.getProvider(
          context.network,
          wallet.topicID,
          wallet.savedPairingData?.accountIds[0] ?? "" // replace with error handling
        );
        const accountBalance = await WalletService.getAccountBalance(
          provider,
          wallet.savedPairingData?.accountIds[0] ?? "" // replace with error handling
        );
        const formattedTokenJsonBalances = getFormattedTokenBalances(accountBalance.tokens);
        set(
          ({ wallet }) => {
            wallet.pairedAccountBalance = accountBalance;
            wallet.pairedAccountBalance.tokens = formattedTokenJsonBalances;
          },
          false,
          WalletActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ wallet }) => {
            wallet.errorMessage = errorMessage;
          },
          false,
          WalletActionType.FETCH_ACCOUNT_BALANCE_FAILED
        );
      }
      app.setFeaturesAsLoaded(["pairedAccountBalance"]);
    },
    handleFoundExtensionEvent: (walletMetadata: HashConnectTypes.WalletMetadata) => {
      set(
        ({ wallet }) => {
          wallet.availableExtension = walletMetadata;
        },
        false,
        WalletActionType.ADD_INSTALLED_EXTENSION
      );
    },
    handlePairingEvent: (approvePairing: MessageTypes.ApprovePairing) => {
      console.log("Paired with wallet", { approvePairing });
      set(
        ({ wallet }) => {
          wallet.savedPairingData = approvePairing.pairingData ?? null;
        },
        false,
        WalletActionType.WALLET_PAIRING_APPROVED
      );
    },
    handleConnectionStatusChangeEvent: (state: HashConnectConnectionState) => {
      console.log("Connection Status Changed", { state });
      set(
        ({ wallet }) => {
          wallet.hashConnectConnectionState = state;
        },
        false,
        WalletActionType.RECEIVED_CONNECTION_STATUS_CHANGED
      );
    },
    handleAcknowledgeMessageEvent: (acknowledgeData: MessageTypes.Acknowledge) => {
      console.log("Ack Received", { acknowledgeData });
    },
    handleTransactionEvent: (transaction: MessageTypes.Transaction) => {
      console.log("Transaction Received", { transaction });
    },
    handleAdditionalAccountRequestEvent: (additionalAccountResponse: MessageTypes.AdditionalAccountRequest) => {
      console.log("Additional Account Response", { additionalAccountResponse });
    },
    setupHashConnectEvents: () => {
      const {
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChangeEvent,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      } = get().wallet;
      WalletService.setupHashConnectEvents({
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChangeEvent,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      });
    },
    destroyHashConnectEvents: () => {
      const {
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChangeEvent,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      } = get().wallet;
      WalletService.destroyHashConnectEvents({
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChangeEvent,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      });
    },
  };
};

export { createWalletSlice };

import { MessageTypes, HashConnectTypes } from "hashconnect";
import { BigNumber } from "bignumber.js";
import { TokenBalanceJson } from "@hashgraph/sdk";
import { getErrorMessage } from "../../utils";
import {
  WalletSlice,
  WalletStore,
  WalletActionType,
  ConnectionStatus,
  WalletConnectionStatus,
  WalletState,
} from "./types";
import { getFormattedTokenBalances, getLocalWalletData } from "./utils";
import { TOKEN_SYMBOL_TO_ACCOUNT_ID, WalletService, WALLET_LOCAL_DATA_KEY } from "../../services";
import { SwapActionType } from "../swapSlice";

const initialWalletState: WalletState = {
  installedExtensions: [],
  walletData: {
    id: null,
    network: "",
    topicID: "",
    walletPairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccountBalance: null,
    pairedAccounts: [],
  },
  walletConnectionStatus: WalletConnectionStatus.INITIALIZING,
  errorMessage: null,
};

function initWalletData(initialWalletState: any) {
  return { ...initialWalletState, ...getLocalWalletData() } ?? initialWalletState;
}
/**
 *
 * @returns
 */
const createWalletSlice: WalletSlice = (set, get): WalletStore => {
  return {
    ...initWalletData(initialWalletState),
    getTokenAmountWithPrecision: (tokenSymbol: string, tokenAmount: number) => {
      const defaultDecimals = 0;
      const { walletData } = get().wallet;
      const tokenData = walletData?.pairedAccountBalance?.tokens;
      const tokenId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenSymbol);
      const decimals =
        tokenData?.find((token: TokenBalanceJson) => token.tokenId === tokenId)?.decimals ?? defaultDecimals;
      return BigNumber(tokenAmount).shiftedBy(decimals).integerValue();
    },
    initializeWalletConnection: async () => {
      set(
        ({ wallet }) => {
          wallet.walletConnectionStatus = WalletConnectionStatus.INITIALIZING;
        },
        false,
        WalletActionType.INITIALIZE_WALLET_CONNECTION_STARTED
      );
      try {
        const { DEXMetaData, network, debug } = get().context;
        const { walletData, initializedDexMetaData } = await WalletService.initWalletConnection(
          DEXMetaData,
          network,
          debug
        );
        set(
          ({ context, wallet }) => {
            context.DEXMetaData = initializedDexMetaData;
            wallet.walletConnectionStatus = WalletConnectionStatus.READY_TO_PAIR;
            wallet.walletData = { ...wallet.walletData, ...walletData };
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
    pairWithConnectedWallet: async () => {
      set({}, false, WalletActionType.PAIR_WITH_CONNECTED_WALLET_STARTED);
      const { DEXMetaData } = get().context;
      const { walletData } = get().wallet;
      try {
        WalletService.pairWithConnectedWallet(DEXMetaData, walletData.privateKey, walletData.topicID);
        set({}, false, WalletActionType.PAIR_WITH_CONNECTED_WALLET_SUCCEEDED);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ wallet }) => {
            wallet.errorMessage = errorMessage;
          },
          false,
          WalletActionType.PAIR_WITH_CONNECTED_WALLET_FAILED
        );
      }
    },
    connectToWallet: () => {
      set({}, false, WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED);
      const { installedExtensions, walletData } = get().wallet;
      const hasInstalledExtensions = installedExtensions?.length > 0;
      if (hasInstalledExtensions) {
        if (walletData?.walletPairingString) {
          const { walletPairingString } = walletData;
          WalletService.connectToWalletExtension(walletPairingString);
          set({}, false, WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED);
        } else {
          const errorMessage = "Selected wallet not installed.";
          set(
            ({ wallet }) => {
              wallet.errorMessage = errorMessage;
            },
            false,
            WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED
          );
        }
      }
    },
    clearWalletPairings: () => {
      localStorage.removeItem(WALLET_LOCAL_DATA_KEY);
      set(
        ({ wallet }) => {
          wallet.walletConnectionStatus = initialWalletState.walletConnectionStatus;
          wallet.walletData.pairedWalletData = initialWalletState.walletData.pairedWalletData;
          wallet.walletData.pairedAccountBalance = initialWalletState.walletData.pairedAccountBalance;
          wallet.walletData.pairedAccounts = initialWalletState.walletData.pairedAccounts;
        },
        false,
        WalletActionType.CLEAR_WALLET_PAIRINGS
      );
    },
    saveWalletDataToLocalStorage: (walletData: any) => {
      const hashconnectDataJSON = JSON.stringify(walletData);
      localStorage.setItem(WALLET_LOCAL_DATA_KEY, hashconnectDataJSON);
    },
    fetchAccountBalance: async () => {
      set({}, false, WalletActionType.FETCH_ACCOUNT_BALANCE_STARTED);
      const { network } = get().context;
      const { walletData } = get().wallet;
      try {
        const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
        const accountBalance = await WalletService.getAccountBalance(provider, walletData.pairedAccounts[0]);
        const formattedTokenJsonBalances = getFormattedTokenBalances(accountBalance.tokens);
        set(
          ({ wallet }) => {
            wallet.walletData.pairedAccountBalance = accountBalance;
            wallet.walletData.pairedAccountBalance.tokens = formattedTokenJsonBalances;
          },
          false,
          WalletActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(({ wallet }) => (wallet.errorMessage = errorMessage), false, WalletActionType.FETCH_ACCOUNT_BALANCE_FAILED);
      }
    },
    handleFoundExtensionEvent: (walletMetadata: HashConnectTypes.WalletMetadata) => {
      set(
        ({ wallet }) => {
          wallet.installedExtensions.push(walletMetadata);
        },
        false,
        WalletActionType.ADD_INSTALLED_EXTENSION
      );
    },
    handlePairingEvent: (approvePairing: MessageTypes.ApprovePairing) => {
      const { walletData } = get().wallet;
      const { metadata, accountIds, topic, id, network } = approvePairing;
      const pairedAccounts = accountIds.filter(
        (accountId: string) => walletData?.pairedAccounts?.indexOf(accountId) === -1
      );
      set(
        ({ wallet }) => {
          wallet.walletConnectionStatus = WalletConnectionStatus.PAIRED;
          wallet.walletData.id = id ? id : null;
          wallet.walletData.network = network;
          wallet.walletData.topicID = topic;
          wallet.walletData.pairedWalletData = metadata;
          wallet.walletData.pairedAccounts = pairedAccounts;
        },
        false,
        WalletActionType.WALLET_PAIRING_APPROVED
      );
    },
    handleAcknowledgeMessageEvent: (acknowledgeData: MessageTypes.Acknowledge) => {
      console.log("Ack Received", { acknowledgeData });
      set(
        ({ swap }) => {
          swap.transactionState.transactionWaitingToBeSigned = true;
        },
        false,
        SwapActionType.SIGN_SWAP_TRANSACTION_STARTED
      );
    },
    handleConnectionStatusChange: (connectionStatus: ConnectionStatus) => {
      console.log("Connection Status Changed", { connectionStatus });
      set({}, false, WalletActionType.RECEIVED_CONNECTION_STATUS_CHANGED);
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
        handleConnectionStatusChange,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      } = get().wallet;
      WalletService.setupHashConnectEvents({
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChange,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      });
    },
    destroyHashConnectEvents: () => {
      const {
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChange,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      } = get().wallet;
      WalletService.destroyHashConnectEvents({
        handleFoundExtensionEvent,
        handlePairingEvent,
        handleAcknowledgeMessageEvent,
        handleConnectionStatusChange,
        handleTransactionEvent,
        handleAdditionalAccountRequestEvent,
      });
    },
  };
};

export { createWalletSlice };

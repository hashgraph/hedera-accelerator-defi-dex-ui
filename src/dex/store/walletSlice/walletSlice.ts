import { BigNumber } from "bignumber.js";
import { TokenBalanceJson } from "@hashgraph/sdk/lib/account/AccountBalance";
import { getErrorMessage } from "../../utils";
import { WalletSlice, WalletStore, WalletActionType, WalletState } from "./types";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { GovernanceTokenId, DexService } from "../../services";
import { LedgerId } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";

const initialWalletState: WalletState = {
  hashConnectConnectionState: HashConnectConnectionState.Disconnected,
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
      const { wallet } = get();
      const accountId = wallet.savedPairingData?.accountIds[0] ?? "";
      const signer = DexService.getSigner(accountId);
      return signer as HashConnectSigner;
    },
    getTokenAmountWithPrecision: (tokenId: string, tokenAmount: number) => {
      const { wallet } = get();
      const defaultDecimals = 8;
      const tokenData = wallet.pairedAccountBalance?.tokens;
      const decimals =
        tokenData?.find((token: TokenBalanceJson) => token.tokenId === tokenId)?.decimals ?? defaultDecimals;
      return BigNumber(tokenAmount).shiftedBy(decimals).integerValue();
    },
    doesUserHaveGODTokensToVote: () => {
      const { wallet } = get();
      const doesUserHaveGodTokens =
        Number(
          wallet.pairedAccountBalance?.tokens.find((token: { tokenId: string }) => token.tokenId === GovernanceTokenId)
            ?.balance
        ) > 1;
      return doesUserHaveGodTokens;
    },
    isPaired: () => {
      const { wallet } = get();
      return wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
    },
    initializeWalletConnection: async () => {
      set({}, false, WalletActionType.INITIALIZE_WALLET_CONNECTION_STARTED);
      try {
        await DexService.initWalletConnection();
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
      DexService.connectToWalletExtension();
      set({}, false, WalletActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED);
    },
    disconnectWallet: async () => {
      set({}, false, WalletActionType.DISCONNECT_WALLET_STARTED);
      try {
        await DexService.disconnect();
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
      const { app, wallet } = get();
      app.setFeaturesAsLoading(["pairedAccountBalance"]);
      try {
        const accountBalance = await DexService.getAccountBalance(wallet.savedPairingData?.accountIds[0] ?? "");

        set(
          ({ wallet }) => {
            wallet.pairedAccountBalance = accountBalance;
            wallet.pairedAccountBalance.tokens = accountBalance.tokens ?? [];
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
    handlePairingEvent: (approvePairing) => {
      console.log("(walletSlice) Paired with wallet data:", { approvePairing });
      set(
        ({ wallet }) => {
          if (approvePairing) {
            wallet.savedPairingData = approvePairing;
          }
        },
        false,
        WalletActionType.WALLET_PAIRING_APPROVED
      );
    },
    handleConnectionStatusChangeEvent: (state: HashConnectConnectionState) => {
      console.log("(walletSlice) Connection status changed:", { state });
      set(
        ({ wallet }) => {
          wallet.hashConnectConnectionState = state;
        },
        false,
        WalletActionType.RECEIVED_CONNECTION_STATUS_CHANGED
      );
    },
    setupHashConnectEvents: () => {
      const { handlePairingEvent, handleConnectionStatusChangeEvent } = get().wallet;
      DexService.setupHashConnectEvents({
        handlePairingEvent,
        handleConnectionStatusChangeEvent,
      });
    },
    destroyHashConnectEvents: () => {
      const { handlePairingEvent, handleConnectionStatusChangeEvent } = get().wallet;
      DexService.destroyHashConnectEvents({
        handlePairingEvent,
        handleConnectionStatusChangeEvent,
      });
    },
    reconnect: (newNetwork: LedgerId) => {
      DexService.reconnectToOtherNetwork(newNetwork);
    },
  };
};

export { createWalletSlice };

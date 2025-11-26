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
      } catch (error) {
        console.warn("Disconnect error (will clear state anyway):", error);
      }
      // Always clear wallet state, even if disconnect had errors
      set(
        ({ wallet }) => {
          wallet.hashConnectConnectionState = HashConnectConnectionState.Disconnected;
          wallet.savedPairingData = null;
          wallet.pairedAccountBalance = null;
          wallet.errorMessage = null;
        },
        false,
        WalletActionType.DISCONNECT_WALLET_SUCCEEDED
      );
    },
    fetchAccountBalance: async () => {
      set({}, false, WalletActionType.FETCH_ACCOUNT_BALANCE_STARTED);
      const { app, wallet } = get();
      app.setFeaturesAsLoading(["pairedAccountBalance"]);

      try {
        // Validate we have a paired account before fetching balance
        const accountId = wallet.savedPairingData?.accountIds[0];

        if (!accountId || accountId.trim() === "") {
          console.warn("(walletSlice) Cannot fetch balance: No paired account found");
          set(
            ({ wallet }) => {
              wallet.errorMessage = "No wallet connected. Please connect your wallet first.";
              wallet.pairedAccountBalance = null;
            },
            false,
            WalletActionType.FETCH_ACCOUNT_BALANCE_FAILED
          );
          app.setFeaturesAsLoaded(["pairedAccountBalance"]);
          return;
        }

        console.log(`(walletSlice) Fetching balance for account: ${accountId}`);
        const accountBalance = await DexService.getAccountBalance(accountId);

        set(
          ({ wallet }) => {
            wallet.pairedAccountBalance = accountBalance;
            wallet.pairedAccountBalance.tokens = accountBalance.tokens ?? [];
            wallet.errorMessage = null; // Clear any previous errors
          },
          false,
          WalletActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED
        );

        console.log("(walletSlice) Balance fetch succeeded:", accountBalance);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("(walletSlice) Balance fetch failed:", errorMessage);
        set(
          ({ wallet }) => {
            wallet.errorMessage = errorMessage;
            wallet.pairedAccountBalance = null; // Clear stale balance data
          },
          false,
          WalletActionType.FETCH_ACCOUNT_BALANCE_FAILED
        );
      }
      app.setFeaturesAsLoaded(["pairedAccountBalance"]);
    },
    handlePairingEvent: async (approvePairing) => {
      console.log("(walletSlice) Paired with wallet data:", { approvePairing });

      if (!approvePairing) return;

      // Filter accounts to match current network
      const currentNetwork = approvePairing.network;
      const accountIds = approvePairing.accountIds || [];

      console.log("(walletSlice) Filtering accounts for network:", currentNetwork);
      console.log("(walletSlice) Available accounts:", accountIds);

      // Validate each account against the current network's mirror node
      const mirrorNodeUrl =
        currentNetwork === "mainnet"
          ? "https://mainnet-public.mirrornode.hedera.com"
          : "https://testnet.mirrornode.hedera.com";

      const validAccounts: string[] = [];
      for (const accountId of accountIds) {
        try {
          const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}`, {
            method: "GET",
            headers: { Accept: "application/json" },
          });

          if (response.ok) {
            validAccounts.push(accountId);
            console.log(`(walletSlice) Account ${accountId} exists on ${currentNetwork}`);
          } else {
            console.log(`(walletSlice) Account ${accountId} does NOT exist on ${currentNetwork}`);
          }
        } catch (error) {
          console.warn(`(walletSlice) Error validating account ${accountId}:`, error);
        }
      }

      if (validAccounts.length === 0) {
        console.error("(walletSlice) No valid accounts found for current network!");
        set(
          ({ wallet }) => {
            wallet.errorMessage =
              `No accounts found for ${currentNetwork}. ` +
              `Please ensure you have accounts on the correct network in your wallet.`;
          },
          false,
          WalletActionType.WALLET_PAIRING_APPROVED
        );
        return;
      }

      console.log(`(walletSlice) Using account ${validAccounts[0]} on ${currentNetwork}`);

      set(
        ({ wallet }) => {
          wallet.savedPairingData = {
            ...approvePairing,
            accountIds: validAccounts,
          };
        },
        false,
        WalletActionType.WALLET_PAIRING_APPROVED
      );

      // Fetch account balance after successful pairing
      const { wallet } = get();
      await wallet.fetchAccountBalance();
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

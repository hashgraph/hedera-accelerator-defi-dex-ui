import { AccountBalanceJson, AccountId, Hbar, LedgerId } from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";
import BigNumber from "bignumber.js";
import { HashConnectEventHandlers } from "./types";
import { DEFAULT_APP_METADATA } from "@dex/context/constants";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { MirrorNodeServiceType, MirrorNodeTokenById } from "@dex/services";
import { getDefaultLedgerId } from "shared";

type WalletServiceType = ReturnType<typeof createWalletService>;

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Synchronously clear localStorage WalletConnect data
// This runs immediately at module load time to prevent HashConnect from loading stale data
// IMPORTANT: We preserve 'activeNetwork' and other app settings
if (typeof window !== "undefined" && window.localStorage) {
  console.log("Module load: Clearing stale WalletConnect localStorage data...");
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Only clear WalletConnect keys, but preserve app settings like 'activeNetwork'
    if (key && (key.startsWith("wc@2") || key.startsWith("hashconnect")) && key !== "activeNetwork") {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    console.log(`Module load: Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
  console.log(`Module load: Cleared ${keysToRemove.length} localStorage keys`);
}

function createWalletService(mirrorNodeService: MirrorNodeServiceType) {
  const appData = { ...DEFAULT_APP_METADATA };
  const hashconnect = new HashConnect(getDefaultLedgerId(), projectId, appData, true);

  const getSigner = (accountId: string): HashConnectSigner | null => {
    if (accountId) {
      return hashconnect.getSigner(AccountId.fromString(accountId));
    }

    return null;
  };

  // Helper function to clear stale WalletConnect/HashConnect data
  const clearStaleConnectionData = () => {
    // Only run in browser context where localStorage exists
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    console.log("Clearing stale WalletConnect/HashConnect data...");

    // Clear localStorage synchronously, but preserve app settings
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Only clear WalletConnect keys, preserve activeNetwork and other app settings
      if (key && (key.startsWith("wc@2") || key.startsWith("hashconnect")) && key !== "activeNetwork") {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${keysToRemove.length} localStorage keys`);

    // Clear IndexedDB asynchronously (don't block on this)
    if (window.indexedDB && window.indexedDB.databases) {
      window.indexedDB
        .databases()
        .then((databases) => {
          for (const db of databases) {
            if (db.name && (db.name.includes("WALLET_CONNECT") || db.name.includes("walletconnect"))) {
              console.log(`Deleting IndexedDB: ${db.name}`);
              window.indexedDB.deleteDatabase(db.name);
            }
          }
        })
        .catch((error) => {
          console.warn("Could not clear IndexedDB:", error);
        });
    }
  };

  const reconnectToOtherNetwork = async (network: LedgerId) => {
    try {
      localStorage.setItem("activeNetwork", network.toString());
      localStorage.setItem("reconnectionInProgress", "true");
      // Ensure disconnect completes fully before reload
      await disconnect();
      // Give a brief moment for disconnect to process, then reload
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.warn("Error during network switch:", error);
    } finally {
      // Always reload to reinitialize with new network
      window.location.reload();
    }
  };

  const initWalletConnection = async () => {
    try {
      await hashconnect.init();
      console.log("HashConnect initialized successfully");
    } catch (error) {
      console.error("HashConnect initialization failed:", error);
      // If init fails, clear data and try one more time
      console.warn("Clearing stale data and retrying initialization...");
      clearStaleConnectionData();

      // Wait a moment for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await hashconnect.init();
        console.log("HashConnect re-initialized successfully after clearing data");
      } catch (retryError) {
        console.error("HashConnect re-initialization also failed:", retryError);
        throw retryError; // Propagate error so caller knows initialization failed
      }
    }
  };

  const connectToWalletExtension = async () => {
    try {
      console.log("Opening HashConnect pairing modal...");
      return await hashconnect.openPairingModal();
    } catch (error) {
      console.error("Failed to open pairing modal:", error);
      // If pairing modal fails, clear data and try again
      console.log("Clearing stale data and retrying...");
      clearStaleConnectionData();
      await hashconnect.init();
      return await hashconnect.openPairingModal();
    }
  };

  const getAccountBalance = async (accountId: string): Promise<AccountBalanceJson> => {
    // Validate accountId before proceeding
    if (!accountId || accountId.trim() === "") {
      console.error("getAccountBalance called with invalid accountId:", accountId);
      throw new Error("Invalid account ID provided");
    }

    try {
      const signer = hashconnect.getSigner(AccountId.fromString(accountId));

      if (!signer) {
        console.warn("No signer available, falling back to Mirror Node");
        throw new Error("Signer not available");
      }

      const walletBalance = await signer.getAccountBalance();
      console.log("Successfully fetched balance from wallet signer");
      return walletBalance.toJSON();
    } catch (err) {
      console.warn("Failed to get balance from signer, using Mirror Node fallback:", err);

      try {
        // Use fetchTokensBalance which properly paginates ALL tokens (limit: 100 per page)
        const tokens = await mirrorNodeService.fetchTokensBalance(accountId);

        const accountTokensData = await Promise.all(
          tokens.map((token) => mirrorNodeService.fetchTokenData(token.token_id)) || []
        );

        // Also fetch HBAR balance
        const balances = await mirrorNodeService.fetchAccountBalances(accountId);
        const accountBalance = balances.find((b) => b.account === accountId);

        const result = {
          hbars: Hbar.fromTinybars(accountBalance?.balance ?? 0).toString(),
          tokens: tokens.map((token) => {
            const tokenData = accountTokensData.find(
              (tokenData) => tokenData.data.token_id === token.token_id
            ) as MirrorNodeTokenById;
            const tokenDecimals = Number(tokenData.data.decimals);

            return {
              decimals: tokenDecimals,
              balance: BigNumber(token.balance).shiftedBy(-tokenDecimals).toString(),
              tokenId: token.token_id,
            };
          }),
        };

        console.log("Successfully fetched balance from Mirror Node");
        return result;
      } catch (mirrorNodeError) {
        console.error("Mirror Node balance fetch also failed:", mirrorNodeError);
        throw new Error(`Failed to fetch account balance: ${mirrorNodeError}`);
      }
    }
  };

  const disconnect = async () => {
    try {
      await hashconnect.disconnect();
    } catch (error) {
      console.warn("Error during disconnect, clearing data anyway:", error);
    }

    // Always clear localStorage data, even if disconnect fails
    clearStaleConnectionData();
  };

  const setupHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const { handlePairingEvent, handleConnectionStatusChangeEvent } = eventHandlers;
    hashconnect.pairingEvent.on(handlePairingEvent);
    hashconnect.connectionStatusChangeEvent.on(handleConnectionStatusChangeEvent);
  };

  const destroyHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const { handlePairingEvent, handleConnectionStatusChangeEvent } = eventHandlers;
    hashconnect.pairingEvent.off(handlePairingEvent);
    hashconnect.connectionStatusChangeEvent.off(handleConnectionStatusChangeEvent);
  };

  return {
    getSigner,
    initWalletConnection,
    connectToWalletExtension,
    getAccountBalance,
    disconnect,
    setupHashConnectEvents,
    destroyHashConnectEvents,
    reconnectToOtherNetwork,
    clearStaleConnectionData, // Expose for manual cleanup if needed
    mirrorNodeService,
  };
}

// Export standalone cleanup utility for emergency use
export function clearAllWalletConnectData() {
  if (typeof window === "undefined") {
    console.warn("Not in browser context, cannot clear data");
    return;
  }

  console.log("🧹 MANUAL CLEANUP: Clearing ALL WalletConnect data...");

  // Clear ALL localStorage (not just wc@2 and hashconnect)
  const allKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) allKeys.push(key);
  }

  allKeys.forEach((key) => {
    if (key.startsWith("wc@2") || key.startsWith("hashconnect") || key.includes("WALLET_CONNECT")) {
      console.log(`🧹 Removing: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Clear IndexedDB
  if (window.indexedDB && window.indexedDB.databases) {
    window.indexedDB.databases().then((databases) => {
      console.log(`🧹 Found ${databases.length} IndexedDB databases`);
      databases.forEach((db) => {
        if (db.name) {
          console.log(`🧹 Deleting IndexedDB: ${db.name}`);
          window.indexedDB.deleteDatabase(db.name);
        }
      });
      console.log("✅ Cleanup complete! Refresh the page.");
    });
  }
}

export type { WalletServiceType };

export { createWalletService };

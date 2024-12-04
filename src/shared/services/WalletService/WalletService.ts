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

function createWalletService(mirrorNodeService: MirrorNodeServiceType) {
  const appData = { ...DEFAULT_APP_METADATA };
  const hashconnect = new HashConnect(getDefaultLedgerId(), projectId, appData, true);

  const getSigner = (accountId: string): HashConnectSigner | null => {
    if (accountId) {
      return hashconnect.getSigner(AccountId.fromString(accountId));
    }

    return null;
  };

  const reconnectToOtherNetwork = async (network: LedgerId) => {
    localStorage.setItem("activeNetwork", network.toString());
    localStorage.setItem("reconnectionInProgress", "true");
    await disconnect();
    setTimeout(() => window.location.reload(), 2000);
  };

  const initWalletConnection = async () => {
    await hashconnect.init();
  };

  const connectToWalletExtension = async () => {
    return hashconnect.openPairingModal();
  };

  const getAccountBalance = async (accountId: string): Promise<AccountBalanceJson> => {
    const signer = hashconnect.getSigner(AccountId.fromString(accountId));

    try {
      const walletBalance = await signer.getAccountBalance();
      return walletBalance.toJSON();
    } catch (err) {
      const balances = await mirrorNodeService.fetchAccountBalances(accountId);
      const accountBalance = balances.find((b) => b.account === accountId);
      const accountTokensData = await Promise.all(
        accountBalance?.tokens.map((token) => mirrorNodeService.fetchTokenData(token.token_id)) || []
      );

      return {
        hbars: Hbar.fromTinybars(accountBalance?.balance ?? 0).toString(),
        tokens: (accountBalance?.tokens || []).map((token) => {
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
    }
  };

  const disconnect = async () => {
    await hashconnect.disconnect();
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
    mirrorNodeService,
  };
}

export type { WalletServiceType };

export { createWalletService };

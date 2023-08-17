import { AccountId } from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectProvider } from "hashconnect/dist/esm/provider/provider";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { Networks } from "../../../dex/store/walletSlice";
import { HashConnectEventHandlers } from "./types";

type WalletServiceType = ReturnType<typeof createWalletService>;

function createWalletService() {
  const hashconnect = new HashConnect(true);

  const getHashconnectInstance = () => {
    return hashconnect;
  };

  const getProvider = (network: string, topicId: string, signingAccount: string): HashConnectProvider => {
    return hashconnect.getProvider(network, topicId, signingAccount);
  };

  const getSigner = (provider: HashConnectProvider): HashConnectSigner => {
    return hashconnect.getSigner(provider);
  };

  const initWalletConnection = async (
    DEXMetaData: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    network: Networks,
    debug: boolean
  ) => {
    /**
     * hashconnect.init mutates the metadata parameter. Since DEXMetaData is a part of the application store
     * it should not be directly mutated. A Type error is throw when the hashconnect.init function
     * is called with DEXMetaData. Passing in a clone of the DEXMetaData state to the hashconnect.init function
     * fixes this issue. The DEXMetaData state is updated later in the set() function.
     * */
    const initializedDexMetaData = { ...DEXMetaData };
    const initData = await hashconnect.init(initializedDexMetaData, network, false);
    return {
      topic: initData.topic,
      pairingString: initData.pairingString,
      savedPairings: initData.savedPairings[0],
    };
  };

  const connectToWalletExtension = async () => {
    return hashconnect.connectToLocalWallet();
  };

  const getAccountBalance = async (provider: HashConnectProvider, accountId: string | AccountId) => {
    const walletBalance = await provider.getAccountBalance(accountId);
    return walletBalance.toJSON();
  };

  const disconnect = async (topic: string) => {
    await hashconnect.disconnect(topic);
  };

  const setupHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const {
      handleFoundExtensionEvent,
      handlePairingEvent,
      handleAcknowledgeMessageEvent,
      handleConnectionStatusChangeEvent,
      handleTransactionEvent,
      handleAdditionalAccountRequestEvent,
    } = eventHandlers;
    hashconnect.foundExtensionEvent.on(handleFoundExtensionEvent);
    hashconnect.pairingEvent.on(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.on(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChangeEvent.on(handleConnectionStatusChangeEvent);
    hashconnect.transactionEvent.on(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.on(handleAdditionalAccountRequestEvent);
  };

  const destroyHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const {
      handleFoundExtensionEvent,
      handlePairingEvent,
      handleAcknowledgeMessageEvent,
      handleConnectionStatusChangeEvent,
      handleTransactionEvent,
      handleAdditionalAccountRequestEvent,
    } = eventHandlers;
    hashconnect.foundExtensionEvent.off(handleFoundExtensionEvent);
    hashconnect.pairingEvent.off(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.off(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChangeEvent.off(handleConnectionStatusChangeEvent);
    hashconnect.transactionEvent.off(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.off(handleAdditionalAccountRequestEvent);
  };

  return {
    getHashconnectInstance,
    getProvider,
    getSigner,
    initWalletConnection,
    connectToWalletExtension,
    getAccountBalance,
    disconnect,
    setupHashConnectEvents,
    destroyHashConnectEvents,
  };
}

export type { WalletServiceType };
export { createWalletService };

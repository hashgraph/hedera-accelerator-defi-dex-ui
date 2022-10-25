import { AccountId } from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectProvider } from "hashconnect/dist/provider/provider";
import { HashConnectEventHandlers } from "./types";

type WalletServiceType = ReturnType<typeof createWalletService>;

function createWalletService() {
  const hashconnect = new HashConnect(true);

  const getHashconnectInstance = () => {
    return hashconnect;
  };

  const getProvider = (network: string, topicId: string, signingAccount: string) => {
    return hashconnect.getProvider(network, topicId, signingAccount);
  };

  const getSigner = (provider: HashConnectProvider) => {
    return hashconnect.getSigner(provider);
  };

  const initWalletConnection = async (
    DEXMetaData: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    network: string,
    debug: boolean
  ) => {
    /**
     * hashconnect.init mutates the metadata parameter. Since DEXMetaData is a part of the application store
     * it should not be directly mutated. A Type error is throw when the hashconnect.init function
     * is called with DEXMetaData. Passing in a clone of the DEXMetaData state to the hashconnect.init function
     * fixes this issue. The DEXMetaData state is updated later in the set() function.
     * */
    const initializedDexMetaData = { ...DEXMetaData };
    const initData = await hashconnect.init(initializedDexMetaData);
    const privateKey = initData.privKey;
    const nodeConnectionState = await hashconnect.connect();
    const walletPairingString = hashconnect.generatePairingString(nodeConnectionState, network, debug ?? false);
    hashconnect.findLocalWallets();
    const walletData = {
      network,
      privateKey: privateKey,
      topicID: nodeConnectionState.topic,
      walletPairingString,
    };
    return { walletData, initializedDexMetaData };
  };

  const pairWithConnectedWallet = async (
    DEXMetaData: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    privateKey: string,
    topicID: string
  ) => {
    /**
     * @see {@link initWalletConnection}
     * */
    const clonedDexMetaData = { ...DEXMetaData };
    await hashconnect.init(clonedDexMetaData, privateKey);
    await hashconnect.connect(topicID, DEXMetaData);
  };

  const connectToWalletExtension = async (pairingString: string) => {
    return hashconnect.connectToLocalWallet(pairingString);
  };

  const getAccountBalance = async (provider: HashConnectProvider, accountId: string | AccountId) => {
    const walletBalance = await provider.getAccountBalance(accountId);
    return walletBalance.toJSON();
  };

  const setupHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const {
      handleFoundExtensionEvent,
      handlePairingEvent,
      handleAcknowledgeMessageEvent,
      handleConnectionStatusChange,
      handleTransactionEvent,
      handleAdditionalAccountRequestEvent,
    } = eventHandlers;
    hashconnect.foundExtensionEvent.on(handleFoundExtensionEvent);
    hashconnect.pairingEvent.on(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.on(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChange.on(handleConnectionStatusChange);
    hashconnect.transactionEvent.on(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.on(handleAdditionalAccountRequestEvent);
  };

  const destroyHashConnectEvents = (eventHandlers: HashConnectEventHandlers) => {
    const {
      handleFoundExtensionEvent,
      handlePairingEvent,
      handleAcknowledgeMessageEvent,
      handleConnectionStatusChange,
      handleTransactionEvent,
      handleAdditionalAccountRequestEvent,
    } = eventHandlers;
    hashconnect.foundExtensionEvent.off(handleFoundExtensionEvent);
    hashconnect.pairingEvent.off(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.off(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChange.off(handleConnectionStatusChange);
    hashconnect.transactionEvent.off(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.off(handleAdditionalAccountRequestEvent);
  };

  return {
    getHashconnectInstance,
    getProvider,
    getSigner,
    initWalletConnection,
    pairWithConnectedWallet,
    connectToWalletExtension,
    getAccountBalance,
    setupHashConnectEvents,
    destroyHashConnectEvents,
  };
}

export type { WalletServiceType };
export { createWalletService };

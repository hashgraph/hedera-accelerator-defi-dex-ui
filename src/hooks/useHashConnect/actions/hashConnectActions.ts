import { ContractExecuteTransaction, ContractFunctionParameters, AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { BigNumber } from "bignumber.js";
import { ActionType, HashConnectAction } from "./actionsTypes";
import { getErrorMessage } from "../utils";

const initializeWalletConnectionStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_STARTED,
  };
};

const initializeWalletConnectionSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_SUCCEEDED,
    field: "walletData",
    payload,
  };
};

const initializeWalletConnectionFailed = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_FAILED,
    payload,
  };
};

const pairWithConnectedWalletStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_STARTED,
  };
};

const pairWithConnectedWalletSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_SUCCEEDED,
  };
};

const pairWithConnectedWalletFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_FAILED,
    payload,
  };
};

const pairWithSelectedWalletExtensionStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED,
  };
};

const pairWithSelectedWalletExtensionSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED,
  };
};

const pairWithSelectedWalletExtensionFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED,
    payload,
  };
};

const fetchAccountBalanceStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_STARTED,
  };
};

const fetchAccountBalanceSucceeded = (payload: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED,
    field: "walletData",
    payload,
  };
};

const fetchAccountBalanceFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_FAILED,
    payload,
  };
};

const sendSwapTransactionToWalletStarted = (): HashConnectAction => {
  return {
    type: ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED,
  };
};

const sendSwapTransactionToWalletSucceeded = (): HashConnectAction => {
  return {
    type: ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED,
  };
};

const sendSwapTransactionToWalletFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_FAILED,
    payload,
  };
};

const initializeWalletConnection = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(initializeWalletConnectionStarted());
    try {
      const { hashconnect, dexMetaData, network, debug } = payload;
      const initData = await hashconnect.init(dexMetaData);
      const privateKey = initData.privKey;
      const nodeConnectionState = await hashconnect.connect();
      const walletPairingString = hashconnect.generatePairingString(nodeConnectionState, network, debug ?? false);
      hashconnect.findLocalWallets();
      const updatedHashconnectData = {
        network,
        privateKey: privateKey,
        topicID: nodeConnectionState.topic,
        walletPairingString,
      };
      dispatch(initializeWalletConnectionSucceeded(updatedHashconnectData));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(initializeWalletConnectionFailed(errorMessage));
    }
  };
};

const pairWithConnectedWallet = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(pairWithConnectedWalletStarted());
    const { hashconnect, dexMetaData, hashConnectState } = payload;
    const { walletData } = hashConnectState;
    try {
      await hashconnect.init(dexMetaData, walletData.privateKey);
      await hashconnect.connect(walletData.topicID, dexMetaData);
      dispatch(pairWithConnectedWalletSucceeded());
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(pairWithConnectedWalletFailed(errorMessage));
    }
  };
};

/**
 *
 * @param payload -
 * @returns Async Action Creator
 */
const pairWithSelectedWalletExtension = (payload: any) => {
  return (dispatch: any) => {
    dispatch(pairWithSelectedWalletExtensionStarted());
    const { hashconnect, installedExtensions, hashConnectState } = payload;
    const { walletData } = hashConnectState;
    const hasInstalledExtensions = installedExtensions?.length > 0;
    if (hasInstalledExtensions) {
      if (walletData?.walletPairingString) {
        const { walletPairingString } = walletData;
        hashconnect.connectToLocalWallet(walletPairingString);
        dispatch(pairWithSelectedWalletExtensionSucceeded());
      } else {
        const errorMessage = "Selected wallet not installed.";
        dispatch(pairWithSelectedWalletExtensionFailed(errorMessage));
      }
    }
  };
};

const fetchAccountBalance = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(fetchAccountBalanceStarted());
    try {
      const { hashconnect, hashConnectState, network } = payload;
      const { walletData } = hashConnectState;
      const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const walletBalance = await provider.getAccountBalance(walletData.pairedAccounts[0]);
      const walletBalanceJSON = walletBalance.toJSON();
      dispatch(fetchAccountBalanceSucceeded(walletBalanceJSON));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(fetchAccountBalanceFailed(errorMessage));
    }
  };
};

const sendSwapTransactionToWallet = (payload: any) => {
  return async (dispatch: any) => {
    const {
      depositTokenAccountId,
      depositTokenAmount,
      // receivingTokenAccountId,
      receivingTokenAmount,
      hashconnect,
      hashConnectState,
      network,
    } = payload;
    const { walletData } = hashConnectState;
    dispatch(sendSwapTransactionToWalletStarted());
    const SWAP_CONTRACT_ID = ContractId.fromString("0.0.47712695");
    const signingAccount = walletData.pairedAccounts[0];
    const walletAddress: string = AccountId.fromString(signingAccount).toSolidityAddress();
    const depositTokenAddress = TokenId.fromString(depositTokenAccountId).toSolidityAddress();
    // temporarily mocking address to strictly swap token A.
    const receivingTokenAddress = TokenId.fromString("0.0.47646100").toSolidityAddress();
    const tokenAQty = new BigNumber(depositTokenAmount);
    const tokenBQty = new BigNumber(receivingTokenAmount);
    const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
    const signer = hashconnect.getSigner(provider);
    try {
      const swapTransaction = await new ContractExecuteTransaction()
        .setContractId(SWAP_CONTRACT_ID)
        .setGas(2000000)
        .setFunction(
          "swapToken",
          new ContractFunctionParameters()
            .addAddress(walletAddress)
            .addAddress(depositTokenAddress) //token A
            .addAddress(receivingTokenAddress)
            .addInt64(tokenAQty)
            .addInt64(tokenBQty)
        )
        .setNodeAccountIds([new AccountId(3)])
        .freezeWithSigner(signer);

      const result = await swapTransaction.executeWithSigner(signer);
      dispatch(sendSwapTransactionToWalletSucceeded());
      /* TODO: Results will be saved in context state and displayed in the UI */
      console.log(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(sendSwapTransactionToWalletFailed(errorMessage));
    }
  };
};

export {
  sendSwapTransactionToWallet,
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
};

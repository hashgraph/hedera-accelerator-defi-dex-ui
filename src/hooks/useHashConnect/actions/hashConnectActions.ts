import { ContractExecuteTransaction, ContractFunctionParameters, AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { BigNumber } from "bignumber.js";
import { ActionType, HashConnectAction } from "./actionsTypes";
import { getErrorMessage } from "../utils";
import { SWAP_CONTRACT_ID } from "../constants";
import { getSpotPrice } from "../../useHederaService/swapContract";

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

const fetchSpotPricesStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_SPOT_PRICES_STARTED,
  };
};

const fetchSpotPricesSucceeded = (payload: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_SPOT_PRICES_SUCCEEDED,
    payload,
  };
};

const fetchSpotPricesFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.FETCH_SPOT_PRICES_FAILED,
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
    const { depositTokenAccountId, depositTokenAmount, hashconnect, hashConnectState, network } = payload;
    const { walletData } = hashConnectState;
    dispatch(sendSwapTransactionToWalletStarted());
    const signingAccount = walletData.pairedAccounts[0];
    const abstractSwapId = ContractId.fromString(SWAP_CONTRACT_ID);
    const walletAddress: string = AccountId.fromString(signingAccount).toSolidityAddress();
    const depositTokenAddress = TokenId.fromString(depositTokenAccountId).toSolidityAddress();
    // temporarily mocking address to strictly swap token A.
    const receivingTokenAddress = TokenId.fromString("0").toSolidityAddress();
    const tokenAQty = new BigNumber(depositTokenAmount);
    const tokenBQty = new BigNumber(0);
    const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
    const signer = hashconnect.getSigner(provider);
    try {
      const swapTransaction = await new ContractExecuteTransaction()
        .setContractId(abstractSwapId)
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

/**
 * Fetches the spot price for swapping L49A tokens for L49B tokens.
 *
 * TODO: This action should be updated to dynamically request spot prices based
 * on two different token symbols. This requires an update to the Swap contract spot price
 * function to support token symbol parameters.
 */
const fetchSpotPrices = () => {
  return async (dispatch: any) => {
    dispatch(fetchSpotPricesStarted());
    try {
      const spotPrices = new Map<string, number | undefined>();
      const precision = 10000000;
      const spotPriceL49BToL49A = await getSpotPrice();
      const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
        ? spotPriceL49BToL49A.toNumber() / precision
        : undefined;
      const spotPriceL49AToL49BWithPrecision = spotPriceL49BToL49AWithPrecision
        ? 1 / spotPriceL49BToL49AWithPrecision
        : undefined;
      spotPrices.set("L49A=>L49B", spotPriceL49AToL49BWithPrecision);
      spotPrices.set("L49B=>L49A", spotPriceL49BToL49AWithPrecision);
      dispatch(fetchSpotPricesSucceeded(spotPrices));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(fetchSpotPricesFailed(errorMessage));
    }
  };
};

export {
  sendSwapTransactionToWallet,
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
  fetchSpotPrices,
};

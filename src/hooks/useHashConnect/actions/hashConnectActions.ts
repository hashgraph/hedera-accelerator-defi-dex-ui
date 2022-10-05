import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountId,
  TokenId,
  ContractId,
  TransactionResponse,
} from "@hashgraph/sdk";
import { BigNumber } from "bignumber.js";
import { ActionType, HashConnectAction } from "./actionsTypes";
import { getErrorMessage } from "../../utils";
import { addLiquidity, pairCurrentPosition } from "../../useHederaService/swapContract";
import { getSpotPrice } from "../../useHederaService/swapContract";
import { SWAP_CONTRACT_ID, TOKEN_SYMBOL_TO_ACCOUNT_ID } from "../../constants";

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

const fetchPoolLiquidityStarted = (): HashConnectAction => {
  return {
    type: ActionType.FETCH_POOL_LIQUIDITY_STARTED,
  };
};

const fetchPoolLiquiditySucceeded = (payload: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_POOL_LIQUIDITY_SUCCEEDED,
    payload,
  };
};

const fetchPoolLiquidityFailed = (payload: string): HashConnectAction => {
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

const sendSwapTransactionToWalletSucceeded = (payload: TransactionResponse): HashConnectAction => {
  return {
    type: ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED,
    payload,
  };
};

const sendSwapTransactionToWalletFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_FAILED,
    payload,
  };
};

const sendAddLiquidityTransactionToWalletStarted = (): HashConnectAction => {
  return {
    type: ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED,
  };
};

const SendAddLiquidityTransactionToWalletSucceeded = (): HashConnectAction => {
  return {
    type: ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED,
  };
};

const sendAddLiquidityTransactionToWalletFailed = (errorMessage: string): HashConnectAction => {
  return {
    type: ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED,
    errorMessage,
  };
};

const clearWalletPairings = (): HashConnectAction => {
  return { type: ActionType.CLEAR_WALLET_PAIRINGS, field: "walletData" };
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
    const { tokenToTrade, /* tokenToReceive, */ hashconnect, hashConnectState, network } = payload;
    const { walletData } = hashConnectState;
    dispatch(sendSwapTransactionToWalletStarted());
    /**
     * Only L49A and L49B swaps are currently supported. The isTokenToTradeL49A and isTokenToTradeL49B booleans
     * were created as a temporary work around to support the current swapToken Swap contract function logic.
     * */
    const isTokenToTradeL49A = tokenToTrade.symbol === "L49A";
    const isTokenToTradeL49B = tokenToTrade.symbol === "L49B";

    const tokenToTradeAccountId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenToTrade.symbol) ?? "";
    // const tokenToReceiveAccountId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenToReceive.symbol) ?? "";
    const signingAccount = walletData.pairedAccounts[0];
    const abstractSwapId = ContractId.fromString(SWAP_CONTRACT_ID);
    const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
    /**
     * Temporarily added ternary logic for tokenToTradeAddress and tokenToReceiveAddress due to current
     * swapToken contract function limitations. The real account IDs for the trading and receiving tokens
     * should be used instead of "0" in future contract iterations.
     * */
    // should be: const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
    const tokenToTradeAddress = TokenId.fromString(
      isTokenToTradeL49A ? tokenToTradeAccountId : "0"
    ).toSolidityAddress();
    // should be: const tokenToReceiveAddress = TokenId.fromString(tokenToReceiveAccountId).toSolidityAddress();
    const tokenToReceiveAddress = TokenId.fromString(
      isTokenToTradeL49B ? tokenToTradeAccountId : "0"
    ).toSolidityAddress();
    /**
     * Temporarily added ternary logic for tokenToTradeAmount and tokenToReceiveAmount due to current swapToken
     * contract function limitations.
     * */
    // should be: const tokenToTradeAmount = new BigNumber(tokenToTrade.amount)
    const tokenToTradeAmount = new BigNumber(isTokenToTradeL49A ? tokenToTrade.amount : 0);
    // should be: const tokenToReceiveAmount = new BigNumber(tokenToReceive.amount)
    const tokenToReceiveAmount = new BigNumber(isTokenToTradeL49B ? tokenToTrade.amount : 0);
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
            .addAddress(tokenToTradeAddress)
            .addAddress(tokenToReceiveAddress)
            .addInt64(tokenToTradeAmount)
            .addInt64(tokenToReceiveAmount)
        )
        .setNodeAccountIds([new AccountId(3)])
        .freezeWithSigner(signer);

      // Sometimes (on first run throught it seems) the AcknowledgeMessageEvent from hashpack does not fire
      // so we need to manually dispatch the action here indicating that transaction is waiting to be signed
      dispatch(setTransactionWaitingToBeSigned(true));

      const result = await swapTransaction.executeWithSigner(signer);
      // Transaction execution is complete after the async call in the line above

      dispatch(setTransactionWaitingToBeSigned(false));
      if (result) {
        dispatch(sendSwapTransactionToWalletSucceeded(result));
      } else {
        throw new Error("Transaction Execution Failed");
      }
      /* TODO: Results will be saved in context state and displayed in the UI */
      console.log(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(sendSwapTransactionToWalletFailed(errorMessage));
    }
  };
};

const sendAddLiquidityTransactionToWallet = (payload: any) => {
  return async (dispatch: any) => {
    const {
      firstTokenAddr,
      firstTokenQty,
      secondTokenAddr,
      secondTokenQty,
      addLiquidityContractAddr,
      hashconnect,
      hashConnectState,
      network,
    } = payload;

    const firstTokenAddress = TokenId.fromString(firstTokenAddr).toSolidityAddress();
    const secondTokenAddress = TokenId.fromString(secondTokenAddr).toSolidityAddress();
    // TODO: currently can only support whole numbers - remove the floor function when decimal values supported
    const firstTokenQuantity = new BigNumber(Math.floor(firstTokenQty));
    const secondTokenQuantity = new BigNumber(Math.floor(secondTokenQty));
    const addLiquidityContractAddress = ContractId.fromString(addLiquidityContractAddr);

    const { walletData } = hashConnectState;
    const signingAccount = walletData.pairedAccounts[0];
    const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
    const provider = hashconnect.getProvider(network, walletData.topicID, signingAccount);
    const signer = hashconnect.getSigner(provider);
    try {
      dispatch(sendAddLiquidityTransactionToWalletStarted());
      await addLiquidity({
        firstTokenAddress,
        firstTokenQuantity,
        secondTokenAddress,
        secondTokenQuantity,
        addLiquidityContractAddress,
        walletAddress,
        signer,
      });
      dispatch(SendAddLiquidityTransactionToWalletSucceeded());
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(sendAddLiquidityTransactionToWalletFailed(errorMessage));
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

// TODO: need to pass in contract address of pool (to pass to pairCurrentPosition)
const getPoolLiquidity = (tokenToTrade: string, tokenToReceive: string) => {
  return async (dispatch: any) => {
    console.log(`Getting pool liquidity for ${tokenToTrade} and ${tokenToReceive}`);
    dispatch(fetchPoolLiquidityStarted());
    try {
      const poolLiquidity = new Map<string, number | undefined>();
      const rawPoolLiquidity = await pairCurrentPosition();
      Object.keys(rawPoolLiquidity).forEach((tokenSymbol) => {
        poolLiquidity.set(tokenSymbol, rawPoolLiquidity[tokenSymbol as keyof typeof rawPoolLiquidity]);
      });
      dispatch(fetchPoolLiquiditySucceeded(poolLiquidity));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      dispatch(fetchPoolLiquidityFailed(errorMessage));
    }
  };
};

export {
  sendSwapTransactionToWallet,
  sendAddLiquidityTransactionToWallet,
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
  fetchSpotPrices,
  getPoolLiquidity,
  clearWalletPairings,
};

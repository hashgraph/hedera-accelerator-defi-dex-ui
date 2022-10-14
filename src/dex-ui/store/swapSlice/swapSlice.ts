import { ContractExecuteTransaction, ContractFunctionParameters, AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { BigNumber } from "bignumber.js";
import {
  WalletService,
  HederaService,
  SWAP_CONTRACT_ID,
  TOKEN_SYMBOL_TO_ACCOUNT_ID,
  TOKEN_A_SYMBOL,
  TOKEN_B_SYMBOL,
  A_TO_B,
  B_TO_A,
} from "../../services";
import { getErrorMessage } from "../../utils";
import { SwapActionType, SwapSlice, SwapStore, SwapState } from "./types";

const initialSwapState: SwapState = {
  spotPrices: {},
  poolLiquidity: {},
  errorMessage: null,
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
};

/**
 *
 * @returns
 */
const createSwapSlice: SwapSlice = (set, get): SwapStore => {
  return {
    ...initialSwapState,
    /**
     * Fetches the spot price for swapping L49A tokens for L49B tokens.
     *
     * TODO: This action should be updated to dynamically request spot prices based
     * on two different token symbols. This requires an update to the Swap contract spot price
     * function to support token symbol parameters.
     */
    fetchSpotPrices: async () => {
      set({}, false, SwapActionType.FETCH_SPOT_PRICES_STARTED);
      try {
        const precision = 10000000;
        const spotPriceL49BToL49A = await HederaService.getSpotPrice();
        const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
          ? spotPriceL49BToL49A.toNumber() / precision
          : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceL49BToL49AWithPrecision
          ? 1 / spotPriceL49BToL49AWithPrecision
          : undefined;
        set(
          ({ swap }) => {
            swap.spotPrices[A_TO_B] = spotPriceL49AToL49BWithPrecision;
            swap.spotPrices[B_TO_A] = spotPriceL49BToL49AWithPrecision;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_FAILED
        );
      }
    },
    // TODO: need to pass in contract address of pool (to pass to pairCurrentPosition)
    getPoolLiquidity: async (tokenToTrade: string, tokenToReceive: string) => {
      console.log(`Getting pool liquidity for ${tokenToTrade} and ${tokenToReceive}`);
      set({}, false, SwapActionType.FETCH_POOL_LIQUIDITY_STARTED);
      try {
        const poolLiquidity = new Map<string, number | undefined>();
        const rawPoolLiquidity = await HederaService.pairCurrentPosition();
        Object.keys(rawPoolLiquidity).forEach((tokenSymbol) => {
          poolLiquidity.set(tokenSymbol, rawPoolLiquidity[tokenSymbol as keyof typeof rawPoolLiquidity]);
        });
        set(
          ({ swap }) => {
            swap.poolLiquidity = Object.fromEntries(poolLiquidity);
          },
          false,
          SwapActionType.FETCH_POOL_LIQUIDITY_SUCCEEDED
        );
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_FAILED
        );
      }
    },
    sendSwapTransaction: async ({ tokenToTrade, tokenToReceive }) => {
      set(
        ({ swap }) => {
          swap.transactionState = initialSwapState.transactionState;
        },
        false,
        SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED
      );

      const { network } = get().context;
      const { walletData } = get().wallet;
      /**
       * Only L49A and L49B swaps are currently supported. The isTokenToTradeL49A and isTokenToTradeL49B booleans
       * were created as a temporary work around to support the current swapToken Swap contract function logic.
       * */
      const isTokenToTradeL49A = tokenToTrade.symbol === TOKEN_A_SYMBOL;
      const isTokenToTradeL49B = tokenToTrade.symbol === TOKEN_B_SYMBOL;

      const tokenToTradeAccountId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenToTrade.symbol) ?? "";
      // const tokenToReceiveAccountId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenToReceive.symbol) ?? "";
      const signingAccount = walletData.pairedAccounts[0];
      const abstractSwapId = ContractId.fromString(SWAP_CONTRACT_ID);
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();

      console.log(
        abstractSwapId,
        signingAccount,
        isTokenToTradeL49A,
        tokenToTradeAccountId,
        isTokenToTradeL49B,
        tokenToTrade.amount
      );
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
      const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = WalletService.getSigner(provider);

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
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = true;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_STARTED
        );
        const result = await swapTransaction.executeWithSigner(signer);
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = false;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_SUCCEEDED
        );
        if (result) {
          set(
            ({ swap }) => {
              swap.transactionState.successPayload = result;
            },
            false,
            SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED
          );
        } else {
          throw new Error("Transaction Execution Failed");
        }
        /* TODO: Results will be saved in context state and displayed in the UI */
        console.log(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.transactionState.errorMessage = errorMessage;
          },
          false,
          SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_FAILED
        );
      }
    },
  };
};

export { createSwapSlice };

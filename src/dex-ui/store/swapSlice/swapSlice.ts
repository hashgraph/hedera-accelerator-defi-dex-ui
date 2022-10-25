import { BigNumber } from "bignumber.js";
import { ContractExecuteTransaction, ContractFunctionParameters, AccountId, TokenId, ContractId } from "@hashgraph/sdk";
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
  precision: undefined,
  fee: undefined,
  spotPrices: {},
  poolLiquidity: {},
  errorMessage: null,
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
  isLoaded: false,
};

/**
 *
 * @returns
 */
const createSwapSlice: SwapSlice = (set, get): SwapStore => {
  return {
    ...initialSwapState,
    getPrecision: () => {
      const precision = HederaService.getPrecision();
      set(
        ({ swap }) => {
          swap.precision = precision;
        },
        false,
        SwapActionType.SET_PRECISION
      );
    },
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
        const { swap } = get();
        const { precision } = swap;
        if (precision === undefined) {
          throw Error("Precision not found");
        }
        const spotPriceL49BToL49A = await HederaService.getSpotPrice();
        const spotPriceL49AToL49B = spotPriceL49BToL49A ? BigNumber(1).dividedBy(spotPriceL49BToL49A) : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceL49AToL49B ? spotPriceL49AToL49B.times(precision) : undefined;
        const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
          ? spotPriceL49BToL49A.dividedBy(precision)
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
    fetchFee: async () => {
      set({}, false, SwapActionType.FETCH_SWAP_FEE_STARTED);
      try {
        const fee = await HederaService.fetchFeeWithPrecision();
        set(
          ({ swap }) => {
            swap.fee = fee;
          },
          false,
          SwapActionType.FETCH_SWAP_FEE_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SWAP_FEE_FAILED
        );
      }
    },
    // TODO: need to pass in contract address of pool (to pass to pairCurrentPosition)
    getPoolLiquidity: async (tokenToTrade: string, tokenToReceive: string) => {
      console.log(`Getting pool liquidity for ${tokenToTrade} and ${tokenToReceive}`);
      const { swap } = get();
      set({}, false, SwapActionType.FETCH_POOL_LIQUIDITY_STARTED);
      try {
        const poolLiquidity = new Map<string, BigNumber | undefined>();
        const rawPoolLiquidity = await HederaService.pairCurrentPosition();
        Object.keys(rawPoolLiquidity).forEach((tokenSymbol) => {
          if (swap.precision === undefined) {
            throw Error("Precision not found");
          }
          const amount = rawPoolLiquidity[tokenSymbol as keyof typeof rawPoolLiquidity];
          poolLiquidity.set(tokenSymbol, amount?.dividedBy(swap.precision.times(10)));
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
      const { context, wallet } = get();
      const { network } = context;
      const { walletData } = wallet;

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
      /**
       * Temporarily added ternary logic for tokenToTradeAddress and tokenToReceiveAddress due to current
       * swapToken contract function limitations. The real account IDs for the trading and receiving tokens
       * should be used instead of "0" in future contract iterations.
       * */
      // should be: const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
      const tokenToTradeAddress = TokenId.fromString(
        isTokenToTradeL49A ? tokenToTradeAccountId : "0.0.47646100"
      ).toSolidityAddress();
      // should be: const tokenToReceiveAddress = TokenId.fromString(tokenToReceiveAccountId).toSolidityAddress();
      const tokenToReceiveAddress = TokenId.fromString(
        isTokenToTradeL49B ? tokenToTradeAccountId : "0.0.47646100"
      ).toSolidityAddress();
      /**
       * Temporarily added ternary logic for tokenToTradeAmount and tokenToReceiveAmount due to current swapToken
       * contract function limitations.
       * */

      // should be: const tokenToTradeAmount = new BigNumber(tokenToTrade.amount)
      const tokenToTradeAmountWithPrecision = wallet.getTokenAmountWithPrecision(
        tokenToTrade.symbol,
        tokenToTrade.amount
      );
      const tokenToTradeAmount = isTokenToTradeL49A ? tokenToTradeAmountWithPrecision : BigNumber(0);
      // should be: const tokenToReceiveAmount = new BigNumber(tokenToReceive.amount)
      const tokenToReceiveAmount = isTokenToTradeL49B ? tokenToTradeAmountWithPrecision : BigNumber(0);

      const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = WalletService.getSigner(provider);

      try {
        /**
         * Testing Token Swap using the HederaService with the new Pair Contract
         */
        const swapTransaction = await new ContractExecuteTransaction()
          .setContractId(abstractSwapId)
          .setGas(9000000)
          .setFunction(
            "swapToken",
            new ContractFunctionParameters()
              .addAddress(walletAddress)
              .addAddress(tokenToTradeAddress)
              .addAddress(tokenToReceiveAddress)
              .addInt256(tokenToTradeAmount)
              .addInt256(tokenToReceiveAmount)
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
    setAsLoading: () => {
      set(
        ({ swap }) => {
          swap.isLoaded = false;
        },
        false,
        SwapActionType.SET_STATE_TO_LOADING
      );
    },
    setAsLoaded: () => {
      set(
        ({ swap }) => {
          swap.isLoaded = true;
        },
        false,
        SwapActionType.SET_STATE_TO_LOADED
      );
    },
  };
};

export { createSwapSlice };

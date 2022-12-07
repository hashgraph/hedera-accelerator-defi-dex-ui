import { BigNumber } from "bignumber.js";
import { ContractExecuteTransaction, ContractFunctionParameters, AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { WalletService, HederaService, FACTORY_CONTRACT_ID, A_TO_B, B_TO_A } from "../../services";
import { getErrorMessage } from "../../utils";
import { SwapActionType, SwapSlice, SwapStore, SwapState, TokenPair } from "./types";

const initialSwapState: SwapState = {
  precision: undefined,
  fee: undefined,
  spotPrices: {},
  poolLiquidity: {},
  errorMessage: null,
  selectedAccount: {
    selectedAccountId: null,
    selectedAToBSymbol: null,
    selectedBToASymbol: null,
  },
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
  tokenPairs: null,
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
    setSelectedAccount: (accountId: string, tokenToTradeASymbol: string, tokenToTradeBSymbol: string) => {
      set(
        ({ swap }) => {
          swap.selectedAccount.selectedAccountId = accountId;
          swap.selectedAccount.selectedAToBSymbol = `${tokenToTradeASymbol}=>${tokenToTradeBSymbol}`;
          swap.selectedAccount.selectedBToASymbol = `${tokenToTradeBSymbol}=>${tokenToTradeASymbol}`;
        },
        false,
        SwapActionType.SET_SELECTED_ACCOUNT_ID
      );
    },
    fetchTokenPairs: async () => {
      set({}, false, SwapActionType.FETCH_TOKEN_PAIRS_STARTED);
      try {
        const pairs = await HederaService.fetchTokenPairs();
        set(
          ({ swap }) => {
            swap.tokenPairs = pairs;
          },
          false,
          SwapActionType.FETCH_TOKEN_PAIRS_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_TOKEN_PAIRS_FAILED
        );
      }
    },
    /**
     * Fetches the spot price for swapping L49A tokens for L49B tokens.
     *
     * TODO: This action should be updated to dynamically request spot prices based
     * on two different token symbols. This requires an update to the Swap contract spot price
     * function to support token symbol parameters.
     */
    fetchSpotPrices: async () => {
      const { swap, app } = get();
      app.setFeaturesAsLoading(["spotPrices"]);
      set({}, false, SwapActionType.FETCH_SPOT_PRICES_STARTED);
      try {
        const { precision, selectedAccount } = swap;
        if (precision === undefined || selectedAccount === null) {
          throw Error("Precision not found");
        }
        const spotPriceL49BToL49A = await HederaService.getSpotPrice(swap.selectedAccount.selectedAccountId ?? "");
        const spotPriceL49AToL49B = spotPriceL49BToL49A ? BigNumber(1).dividedBy(spotPriceL49BToL49A) : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceL49AToL49B ? spotPriceL49AToL49B.times(precision) : undefined;
        const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
          ? spotPriceL49BToL49A.dividedBy(precision)
          : undefined;
        set(
          ({ swap }) => {
            swap.spotPrices[swap.selectedAccount.selectedAToBSymbol ?? ""] = spotPriceL49AToL49BWithPrecision;
            swap.spotPrices[swap.selectedAccount.selectedBToASymbol ?? ""] = spotPriceL49BToL49AWithPrecision;
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
      app.setFeaturesAsLoaded(["spotPrices"]);
    },
    fetchFee: async () => {
      const { app } = get();
      app.setFeaturesAsLoading(["fee"]);
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
      app.setFeaturesAsLoaded(["fee"]);
    },
    // TODO: need to pass in contract address of pool (to pass to pairCurrentPosition)
    getPoolLiquidity: async (tokenToTrade: TokenPair, tokenToReceive: TokenPair) => {
      console.log(`Getting pool liquidity
       ${JSON.stringify(tokenToTrade, null, 2)} and 
       ${JSON.stringify(tokenToReceive, null, 2)}`);
      const { swap, app } = get();

      if (tokenToReceive.tokenMeta.pairContractId !== tokenToTrade.tokenMeta.pairContractId) {
        swap.errorMessage = "Swap Tokens not available for selected tokens";
        return;
      }

      app.setFeaturesAsLoading(["poolLiquidity"]);
      set({}, false, SwapActionType.FETCH_POOL_LIQUIDITY_STARTED);
      try {
        const poolLiquidity = new Map<string, BigNumber | undefined>();
        // TODO: In below Contract call we are directly returining the hard coded
        // Token A and Token B in real scenario how will we know which is token A and which is token B
        const pairId = ContractId.fromString(tokenToReceive.tokenMeta.pairContractId ?? "");
        const { tokenAAddress } = await HederaService.getTokenPairAddress(
          ContractId.fromString(tokenToTrade.tokenMeta.pairContractId ?? "")
        );
        const rawPoolLiquidity = await HederaService.pairCurrentPosition(pairId);

        let tokens: { [x: string]: BigNumber } = {};
        if (tokenAAddress === tokenToTrade.tokenMeta.tokenId) {
          tokens = {
            [tokenToTrade.symbol ?? ""]: rawPoolLiquidity.tokenAQty,
            [tokenToReceive.symbol ?? ""]: rawPoolLiquidity.tokenBQty,
          };
        } else {
          tokens = {
            [tokenToTrade.symbol ?? ""]: rawPoolLiquidity.tokenBQty,
            [tokenToReceive.symbol ?? ""]: rawPoolLiquidity.tokenAQty,
          };
        }

        Object.keys(tokens).forEach((tokenSymbol) => {
          if (swap.precision === undefined) {
            throw Error("Precision not found");
          }
          const amount = tokens[tokenSymbol];
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
      app.setFeaturesAsLoaded(["poolLiquidity"]);
    },
    sendSwapTransaction: async (tokenToTrade: TokenPair, tokenToReceive: TokenPair) => {
      const { context, wallet, app, swap } = get();
      app.setFeaturesAsLoading(["transactionState"]);
      set(
        ({ swap }) => {
          swap.transactionState = initialSwapState.transactionState;
        },
        false,
        SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED
      );
      /**
       * Only L49A and L49B swaps are currently supported. The isTokenToTradeL49A and isTokenToTradeL49B booleans
       * were created as a temporary work around to support the current swapToken Swap contract function logic.
       * */
      // const isTokenToTradeL49A = swap.tokenPairs?.indexOf(tokenToTrade);
      // const isTokenToTradeL49B = swap.tokenPairs?.includes(tokenToReceive);
      const tokenToTradeAccountId = tokenToTrade.tokenMeta.tokenId ?? "";
      const tokenToReceiveccountId = tokenToTrade.tokenMeta.tokenId ?? "";
      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const abstractSwapId = ContractId.fromString(FACTORY_CONTRACT_ID);
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      /**
       * Temporarily added ternary logic for tokenToTradeAddress and tokenToReceiveAddress due to current
       * swapToken contract function limitations. The real account IDs for the trading and receiving tokens
       * should be used instead of "0" in future contract iterations.
       * */
      // should be: const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
      const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
      // should be: const tokenToReceiveAddress = TokenId.fromString(tokenToReceiveAccountId).toSolidityAddress();
      const tokenToReceiveAddress = TokenId.fromString(tokenToReceiveccountId).toSolidityAddress();
      /**
       * Temporarily added ternary logic for tokenToTradeAmount and tokenToReceiveAmount due to current swapToken
       * contract function limitations.
       * */

      // should be: const tokenToTradeAmount = new BigNumber(tokenToTrade.amount)
      const tokenToTradeAmountWithPrecision = wallet.getTokenAmountWithPrecision(
        tokenToTrade.symbol ?? "",
        tokenToTrade.amount ?? ""
      );
      const tokenToTradeAmount = tokenToTradeAmountWithPrecision;
      // should be: const tokenToReceiveAmount = new BigNumber(tokenToReceive.amount)
      const tokenToReceiveAmount = tokenToTradeAmountWithPrecision;

      const provider = WalletService.getProvider(
        context.network,
        wallet.topicID,
        wallet.savedPairingData?.accountIds[0] ?? ""
      );
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
      app.setFeaturesAsLoaded(["transactionState"]);
    },
  };
};

export { createSwapSlice };

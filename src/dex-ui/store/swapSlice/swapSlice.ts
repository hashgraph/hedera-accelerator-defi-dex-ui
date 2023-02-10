import { BigNumber } from "bignumber.js";
import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { DexService, MirrorNodeTokenByIdResponse, MirrorNodeTokenPairResponse } from "../../services";
import { getErrorMessage, isHbarToken, valueToPercentAsNumberWithPrecision, withPrecision } from "../../utils";
import { SwapActionType, SwapSlice, SwapStore, SwapState, Token, TokenPair } from "./types";
import { isEmpty } from "ramda";

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
  tokenPairs: null,
};

function getTokenInfoObj(token: MirrorNodeTokenByIdResponse, pair: MirrorNodeTokenPairResponse) {
  return {
    amount: 0.0,
    displayAmount: "",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: token.data.name,
    totalSupply: token.data.total_supply,
    maxSupply: null,
    symbol: token.data.symbol,
    tokenMeta: {
      pairAccountId: pair.data.contract_id,
      tokenId: token.data.token_id,
    },
  };
}

const fetchEachToken = async (evmAddress: string) => {
  const pairData = await DexService.fetchContract(evmAddress);
  const { tokenATokenId, tokenBTokenId, lpTokenId } = await DexService.fetchPairTokenIds(pairData.data.contract_id);

  const [tokenAInfo, tokenBInfo, tokenCInfo] = await Promise.all([
    DexService.fetchTokenData(tokenATokenId),
    DexService.fetchTokenData(tokenBTokenId),
    DexService.fetchTokenData(lpTokenId),
  ]);

  const tokenAInfoDetails: Token = getTokenInfoObj(tokenAInfo, pairData);
  const tokenBInfoDetails: Token = getTokenInfoObj(tokenBInfo, pairData);

  const pairToken = {
    symbol: tokenCInfo.data.symbol,
    pairLpAccountId: lpTokenId,
    totalSupply: tokenCInfo.data.total_supply,
    decimals: tokenCInfo.data.decimals,
  };
  const updated: TokenPair = {
    pairToken,
    tokenA: tokenAInfoDetails,
    tokenB: tokenBInfoDetails,
  };
  return updated;
};

/**
 *
 * @returns
 */

const createSwapSlice: SwapSlice = (set, get): SwapStore => {
  return {
    ...initialSwapState,
    getPrecision: async (selectedAccountId: string) => {
      try {
        const precision = await DexService.fetchPrecisionValue(selectedAccountId ?? "");
        set(
          ({ swap }) => {
            swap.precision = precision;
          },
          false,
          SwapActionType.SET_PRECISION
        );
      } catch {
        // TODO: A fix for To get Precision and get The UI working when no account is selected
        const precision = DexService.getPrecision();
        set(
          ({ swap }) => {
            swap.precision = precision;
          },
          false,
          SwapActionType.SET_PRECISION
        );
      }
    },
    fetchTokenPairs: async () => {
      set({}, false, SwapActionType.FETCH_TOKEN_PAIRS_STARTED);
      const { app } = get();
      app.setFeaturesAsLoading(["tokenPairs"]);
      try {
        const pairsAddresses = await DexService.fetchAllTokenPairs();
        const urlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const pairs = await Promise.all(urlRequest);
        set(
          ({ swap }) => {
            swap.tokenPairs = pairs;
          },
          false,
          SwapActionType.FETCH_TOKEN_PAIRS_SUCCEEDED
        );
        app.setFeaturesAsLoaded(["tokenPairs"]);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        app.setFeaturesAsLoaded(["tokenPairs"]);
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
     * Fetches the spot price for from a pair contract to determine the
     * exchange rates to and from Token A and Token B.
     */
    fetchSpotPrices: async (selectedAccountId: string) => {
      const { swap, app } = get();
      if (isEmpty(selectedAccountId)) {
        return;
      }
      set({}, false, SwapActionType.FETCH_SPOT_PRICES_STARTED);
      app.setFeaturesAsLoading(["spotPrices"]);
      try {
        const { precision } = swap;
        if (precision === undefined) {
          throw Error("Precision not found");
        }
        const [spotPriceTokenBToTokenA, pairTokenIds] = await Promise.all([
          DexService.fetchSpotPrice(selectedAccountId),
          DexService.fetchPairTokenIds(selectedAccountId),
        ]);
        const spotPriceTokenAToTokenB = spotPriceTokenBToTokenA
          ? BigNumber(1).dividedBy(spotPriceTokenBToTokenA)
          : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceTokenAToTokenB
          ? spotPriceTokenAToTokenB.times(precision)
          : undefined;
        const spotPriceL49BToL49AWithPrecision = spotPriceTokenBToTokenA
          ? spotPriceTokenBToTokenA.dividedBy(precision)
          : undefined;
        const selectedAToBRoute = `${pairTokenIds.tokenATokenId}=>${pairTokenIds.tokenBTokenId}`;
        const selectedBToARoute = `${pairTokenIds.tokenBTokenId}=>${pairTokenIds.tokenATokenId}`;
        set(
          ({ swap }) => {
            swap.spotPrices[selectedAToBRoute] = spotPriceL49AToL49BWithPrecision;
            swap.spotPrices[selectedBToARoute] = spotPriceL49BToL49AWithPrecision;
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
    fetchFee: async (selectedAccountId: string) => {
      const { app } = get();
      if (!selectedAccountId) {
        return;
      }
      app.setFeaturesAsLoading(["fee"]);
      set({}, false, SwapActionType.FETCH_SWAP_FEE_STARTED);
      try {
        const fee = await DexService.fetchFeeWithPrecision(selectedAccountId);
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
    // TODO: need to pass in contract address of pool (to pass to getPoolTokenBalances)
    getPoolLiquidity: async (tokenToTrade: Token, tokenToReceive: Token) => {
      console.log(`Getting pool liquidity
       ${JSON.stringify(tokenToTrade, null, 2)} and 
       ${JSON.stringify(tokenToReceive, null, 2)}`);
      const { swap, app } = get();

      if (tokenToReceive.tokenMeta.pairAccountId !== tokenToTrade.tokenMeta.pairAccountId) {
        set(
          ({ swap }) => {
            swap.errorMessage = "Swap Tokens not available for selected tokens";
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_FAILED
        );
        return;
      }

      app.setFeaturesAsLoading(["poolLiquidity"]);
      set({}, false, SwapActionType.FETCH_POOL_LIQUIDITY_STARTED);
      try {
        const { tokenATokenId } = await DexService.fetchPairTokenIds(tokenToTrade.tokenMeta.pairAccountId ?? "");
        const poolTokenBalances = await DexService.fetchPoolTokenBalances(tokenToReceive.tokenMeta.pairAccountId ?? "");
        const isTokenToTradeTokenA = tokenATokenId === tokenToTrade.tokenMeta.tokenId;
        const tokenAId = isTokenToTradeTokenA
          ? tokenToTrade.tokenMeta.tokenId ?? ""
          : tokenToReceive.tokenMeta.tokenId ?? "";
        const tokenBId = isTokenToTradeTokenA
          ? tokenToReceive.tokenMeta.tokenId ?? ""
          : tokenToTrade.tokenMeta.tokenId ?? "";
        if (swap.precision === undefined) {
          throw Error("Precision not found");
        }
        const poolLiquidity = {
          [tokenAId]: withPrecision(poolTokenBalances.tokenAQty, swap.precision),
          [tokenBId]: withPrecision(poolTokenBalances.tokenBQty, swap.precision),
        };
        set(
          ({ swap }) => {
            swap.poolLiquidity = poolLiquidity;
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
    sendSwapTransaction: async (tokenToTrade: Token, slippageTolerance: number, transactionDeadline: number) => {
      const { context, wallet, app, swap } = get();
      app.setFeaturesAsLoading(["transactionState"]);
      set(
        ({ swap }) => {
          swap.transactionState = initialSwapState.transactionState;
        },
        false,
        SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED
      );
      const tokenToTradeAccountId = tokenToTrade.tokenMeta.tokenId ?? "";
      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const contractId = ContractId.fromString(tokenToTrade.tokenMeta.pairAccountId ?? "");
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
      const tokenToTradeAmount = isHbarToken(tokenToTradeAccountId)
        ? BigNumber(0)
        : wallet.getTokenAmountWithPrecision(tokenToTrade.tokenMeta.tokenId ?? "", tokenToTrade.amount ?? "");
      const HbarAmount = isHbarToken(tokenToTradeAccountId) ? tokenToTrade.amount : 0.0;
      const provider = DexService.getProvider(
        context.network,
        wallet.topicID,
        wallet.savedPairingData?.accountIds[0] ?? ""
      );
      const signer = DexService.getSigner(provider);
      if (swap.precision === undefined) {
        throw Error("Precision not found");
      }
      const preciseSlippage = valueToPercentAsNumberWithPrecision(slippageTolerance, swap.precision);
      try {
        // Sometimes (on first run throught it seems) the AcknowledgeMessageEvent from hashpack does not fire
        // so we need to manually dispatch the action here indicating that transaction is waiting to be signed
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = true;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_STARTED
        );
        const result = await DexService.swapToken({
          contractId,
          walletAddress,
          tokenToTradeAddress,
          tokenToTradeAmount,
          slippageTolerance: preciseSlippage,
          transactionDeadline,
          HbarAmount,
          signer,
        });
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

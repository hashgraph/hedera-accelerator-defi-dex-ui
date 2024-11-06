import { BigNumber } from "bignumber.js";
import { AccountId, TokenId, ContractId, TokenBalanceJson, TokenAssociateTransaction } from "@hashgraph/sdk";
import { DexService, MirrorNodeTokenById, MirrorNodeTokenPairResponse } from "../../services";
import { getErrorMessage, isHbarToken, withPrecision } from "../../utils";
import { SwapActionType, SwapSlice, SwapStore, SwapState, Token, TokenPair } from "./types";
import { isNil } from "ramda";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnectSigner } from "hashconnect/dist/signer";

const initialSwapState: SwapState = {
  pairInfo: {
    fee: undefined,
    spotPrices: {},
    precision: undefined,
  },
  poolLiquidity: {},
  errorMessage: null,
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
  tokenPairs: null,
};

function getTokenInfoObj(
  token: MirrorNodeTokenById,
  pair: MirrorNodeTokenPairResponse,
  fee: BigNumber,
  lpTokenId: string
) {
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
      fee,
      lpTokenId,
    },
  };
}

const fetchEachToken = async (evmAddress: string) => {
  const pairData = await DexService.fetchContract(evmAddress);
  const { tokenATokenId, tokenBTokenId, lpTokenId, fee } = await DexService.fetchPairTokenIds(
    pairData.data.contract_id
  );

  const [tokenAInfo, tokenBInfo, tokenCInfo] = await Promise.all([
    DexService.fetchTokenData(tokenATokenId),
    DexService.fetchTokenData(tokenBTokenId),
    DexService.fetchTokenData(lpTokenId),
  ]);

  const tokenAInfoDetails: Token = getTokenInfoObj(tokenAInfo, pairData, fee, lpTokenId);
  const tokenBInfoDetails: Token = getTokenInfoObj(tokenBInfo, pairData, fee, lpTokenId);

  const lpTokenMeta = {
    symbol: tokenCInfo.data.symbol,
    lpAccountId: lpTokenId,
    totalSupply: tokenCInfo.data.total_supply,
    decimals: Number(tokenCInfo.data.decimals),
  };
  const updated: TokenPair = {
    lpTokenMeta,
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
    fetchPairInfo: async (selectedAccountId: string) => {
      const { app } = get();
      app.setFeaturesAsLoading(["pairInfo"]);
      set({}, false, SwapActionType.FETCH_PAIR_INFO_STARTED);
      try {
        const pairData = await DexService.getPairInfo(selectedAccountId);
        if (pairData.precision === undefined) {
          throw Error("Precision not found");
        }
        /**
         * Fetches the spot price for from a pair contract to determine the
         * exchange rates to and from Token A and Token B.
         */
        const spotPriceTokenAToTokenB = pairData.tokenASpotPrice
          ? BigNumber(1).dividedBy(pairData.tokenASpotPrice)
          : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceTokenAToTokenB
          ? spotPriceTokenAToTokenB.times(pairData.precision)
          : undefined;
        const spotPriceL49BToL49AWithPrecision = pairData.tokenBSpotPrice
          ? pairData.tokenBSpotPrice.dividedBy(pairData.precision)
          : undefined;

        const selectedAToBRoute = `${pairData.tokenATokenId}=>${pairData.tokenBTokenId}`;
        const selectedBToARoute = `${pairData.tokenBTokenId}=>${pairData.tokenATokenId}`;
        set(
          ({ swap }) => {
            swap.pairInfo.precision = pairData.precision;
            swap.pairInfo.spotPrices[selectedAToBRoute] = spotPriceL49AToL49BWithPrecision;
            swap.pairInfo.spotPrices[selectedBToARoute] = spotPriceL49BToL49AWithPrecision;
            swap.pairInfo.fee = pairData.feeWithPrecision;
          },
          false,
          SwapActionType.FETCH_PAIR_INFO_SUCCEEDED
        );
        app.setFeaturesAsLoaded(["pairInfo"]);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        const precision = DexService.getPrecision();
        app.setFeaturesAsLoaded(["pairInfo"]);
        set(
          ({ swap }) => {
            swap.pairInfo.precision = precision;
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_PAIR_INFO_FAILED
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
          SwapActionType.FETCH_POOL_LIQUIDITY_FAILED
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
        if (swap.pairInfo.precision === undefined) {
          throw Error("Precision not found");
        }
        const poolLiquidity = {
          [tokenAId]: withPrecision(poolTokenBalances.tokenAQty, swap.pairInfo.precision),
          [tokenBId]: withPrecision(poolTokenBalances.tokenBQty, swap.pairInfo.precision),
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
          SwapActionType.FETCH_POOL_LIQUIDITY_FAILED
        );
      }
      app.setFeaturesAsLoaded(["poolLiquidity"]);
    },
    sendSwapTransaction: async (
      tokenToTrade: Token,
      slippageTolerance: number,
      transactionDeadline: number,
      tokenToReceiveId: string
    ) => {
      const { wallet, app, swap } = get();
      app.setFeaturesAsLoading(["transactionState"]);
      set(
        ({ swap }) => {
          swap.transactionState = initialSwapState.transactionState;
        },
        false,
        SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED
      );
      const tokenToTradeId = tokenToTrade.tokenMeta.tokenId ?? "";
      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const contractId = ContractId.fromString(tokenToTrade.tokenMeta.pairAccountId ?? "");
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const tokenToTradeAddress = TokenId.fromString(tokenToTradeId).toSolidityAddress();
      const tokenAmount = wallet.getTokenAmountWithPrecision(
        tokenToTrade.tokenMeta.tokenId ?? "",
        tokenToTrade.amount ?? ""
      );
      const tokenToTradeAmount = isHbarToken(tokenToTradeId) ? BigNumber(0) : tokenAmount;
      const HbarAmount = isHbarToken(tokenToTradeId) ? tokenToTrade.amount : 0.0;
      const signer = DexService.getSigner(wallet.savedPairingData?.accountIds[0] ?? "");
      if (swap.pairInfo.precision === undefined) {
        throw Error("Precision not found");
      }
      // const preciseSlippage = valueToPercentAsNumberWithPrecision(slippageTolerance, swap.pairInfo.precision);
      const preciseSlippage = BigNumber(slippageTolerance).times(swap.pairInfo.precision);
      try {
        // Sometimes (on first run throughout it seems) the AcknowledgeMessageEvent from hashpack does not fire
        // so we need to manually dispatch the action here indicating that transaction is waiting to be signed
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = true;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_STARTED
        );

        if (isHbarToken(tokenToTradeId)) {
          await DexService.setHbarTokenAllowance({
            walletId: signingAccount,
            spenderContractId: tokenToTrade.tokenMeta.pairAccountId ?? "",
            tokenAmount: tokenAmount.toNumber(),
            signer: signer as HashConnectSigner,
          });
        } else {
          await DexService.setTokenAllowance({
            tokenId: tokenToTradeId,
            walletId: signingAccount,
            spenderContractId: tokenToTrade.tokenMeta.pairAccountId ?? "",
            tokenAmount: tokenAmount.toNumber(),
            signer: signer as HashConnectSigner,
          });
        }

        const tokenData = wallet.pairedAccountBalance?.tokens;
        const tokenToReceiveBalance = tokenData?.find(
          (token: TokenBalanceJson) => token.tokenId === tokenToReceiveId
        )?.balance;
        const isTokenNotAssociated = isNil(tokenToReceiveBalance);
        const isReceivingTokenHbar = isHbarToken(tokenToReceiveId);
        if (isTokenNotAssociated && !isReceivingTokenHbar) {
          const tokenAssociateTx = new TokenAssociateTransaction()
            .setAccountId(signingAccount)
            .setTokenIds([tokenToReceiveId]);
          const tokenAssociateSignedTx = await tokenAssociateTx.freezeWithSigner(signer as HashConnectSigner);
          await tokenAssociateSignedTx.executeWithSigner(signer as HashConnectSigner);
        }

        const result = await DexService.swapToken({
          contractId,
          walletAddress,
          tokenToTradeAddress,
          tokenToTradeAmount,
          slippageTolerance: preciseSlippage,
          transactionDeadline,
          HbarAmount,
          signer: signer as HashConnectSigner,
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

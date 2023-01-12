import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { getErrorMessage } from "../../utils";
import { BigNumber } from "bignumber.js";
import {
  PoolsSlice,
  PoolsStore,
  PoolsState,
  PoolsActionType,
  SendAddLiquidityTransactionParams,
  TokenPair,
  Token,
  FetchSpotPriceParams,
} from "./types";
import { MirrorNodeService, WalletService, HederaService, MirrorNodeTokenBalance } from "../../services";
import { calculatePoolMetrics, calculateUserPoolMetrics } from "./utils";
import { isNil } from "ramda";
import { getTimestamp7DaysAgo, getTransactionsFromLast24Hours } from "../../utils";

const initialPoolsStore: PoolsState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  poolTokenBalances: [],
  userTokenBalances: undefined,
  spotPrices: {},
  status: "init",
  errorMessage: null,
  withdrawState: {
    status: "init",
    successPayload: null,
    errorMessage: "",
  },
};

const fetchEachToken = async (evmAddress: string) => {
  const pairData = await MirrorNodeService.fetchContract(evmAddress);
  const pairContractId = ContractId.fromString(pairData.data.contract_id);
  const { tokenAAddress, tokenBAddress, tokenCAddress } = await HederaService.getTokenPairAddress(pairContractId);

  const [tokenAInfo, tokenBInfo, tokenCInfo] = await Promise.all([
    MirrorNodeService.fetchTokenData(tokenAAddress),
    MirrorNodeService.fetchTokenData(tokenBAddress),
    MirrorNodeService.fetchTokenData(tokenCAddress),
  ]);

  const tokenAInfoDetails: Token = {
    amount: 0.0,
    displayAmount: "",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: tokenAInfo.data.name,
    totalSupply: tokenAInfo.data.total_supply,
    maxSupply: null,
    symbol: tokenAInfo.data.symbol,
    tokenMeta: {
      pairAccountId: pairData.data.contract_id,
      tokenId: tokenAInfo.data.token_id,
    },
  };

  const tokenBInfoDetails: Token = {
    amount: 0.0,
    displayAmount: "",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: tokenBInfo.data.name,
    totalSupply: tokenBInfo.data.total_supply,
    maxSupply: null,
    symbol: tokenBInfo.data.symbol,
    tokenMeta: {
      pairAccountId: pairData.data.contract_id,
      tokenId: tokenBInfo.data.token_id,
    },
  };
  const pairToken = {
    symbol: tokenCInfo.data.symbol,
    pairLpAccountId: tokenCAddress,
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

const metricesForEachPair = async (pair: TokenPair) => {
  const tokenPairBalance = await MirrorNodeService.fetchAccountTokenBalances(pair.tokenA.tokenMeta.pairAccountId ?? "");
  const poolFee = await HederaService.fetchFeeWithPrecision(pair.tokenA.tokenMeta.pairAccountId ?? "");
  const timestamp7DaysAgo = getTimestamp7DaysAgo();
  const last7DTransactions = await MirrorNodeService.fetchAccountTransactions(
    pair.tokenA.tokenMeta.pairAccountId ?? "",
    timestamp7DaysAgo
  );
  const last24Transactions = getTransactionsFromLast24Hours(last7DTransactions);
  return calculatePoolMetrics({
    poolAccountId: pair.tokenA.tokenMeta.pairAccountId ?? "",
    poolTokenBalances: tokenPairBalance,
    last24Transactions,
    last7DTransactions,
    tokenPair: pair,
    poolFee,
  });
};

const getAllPoolBalanceFor = async (pair: TokenPair) => {
  return await MirrorNodeService.fetchAccountTokenBalances(pair.tokenA.tokenMeta.pairAccountId ?? "");
};

/**
 * @returns
 */
const createPoolsSlice: PoolsSlice = (set, get): PoolsStore => {
  return {
    ...initialPoolsStore,
    sendAddLiquidityTransaction: async ({ inputToken, outputToken, contractId }: SendAddLiquidityTransactionParams) => {
      const { wallet } = get();
      const { network } = get().context;
      const firstTokenAddress = TokenId.fromString(inputToken.address).toSolidityAddress();
      const secondTokenAddress = TokenId.fromString(outputToken.address).toSolidityAddress();
      const firstTokenQuantity = wallet.getTokenAmountWithPrecision(inputToken.address, inputToken.amount);
      const secondTokenQuantity = wallet.getTokenAmountWithPrecision(outputToken.address, outputToken.amount);
      const addLiquidityContractAddress = ContractId.fromString(contractId);

      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const provider = WalletService.getProvider(network, wallet.topicID, signingAccount);
      const signer = WalletService.getSigner(provider);
      try {
        set({}, false, PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED);
        await HederaService.addLiquidity({
          firstTokenAddress,
          firstTokenQuantity,
          secondTokenAddress,
          secondTokenQuantity,
          addLiquidityContractAddress,
          walletAddress,
          signer,
        });
        set({}, false, PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED
        );
      }
    },
    fetchAllPoolMetrics: async () => {
      const { app } = get();
      set(
        ({ pools }) => {
          pools.status = "fetching";
        },
        false,
        PoolsActionType.FETCH_ALL_POOL_METRICS_STARTED
      );
      app.setFeaturesAsLoading(["allPoolsMetrics"]);
      try {
        const pairsAddresses = await HederaService.fetchTokenPairs();
        const addressessURlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const poolTokenPairs = await Promise.all(addressessURlRequest);
        const addressessURlRequestForMetrices = poolTokenPairs?.map((pair) => metricesForEachPair(pair));
        const allPoolMetrices = await Promise.all(addressessURlRequestForMetrices);
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.allPoolsMetrics = allPoolMetrices;
          },
          false,
          PoolsActionType.FETCH_ALL_METRICS_SUCCEEDED
        );
        app.setFeaturesAsLoaded(["allPoolsMetrics"]);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.status = "error";
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.FETCH_ALL_METRICS_FAILED
        );
      }
      app.setFeaturesAsLoaded(["allPoolsMetrics"]);
    },
    fetchUserPoolMetrics: async (userAccountId: string) => {
      const { app } = get();
      set(
        ({ pools }) => {
          pools.status = "fetching";
        },
        false,
        PoolsActionType.FETCH_USER_POOL_METRICS_STARTED
      );
      app.setFeaturesAsLoading(["userPoolsMetrics"]);
      try {
        if (isNil(userAccountId)) {
          throw Error("User Account ID must be defined.");
        }
        const userTokenBalances = await MirrorNodeService.fetchAccountTokenBalances(userAccountId);
        const pairsAddresses = await HederaService.fetchTokenPairs();
        const addressessURlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const poolTokenPairs = await Promise.all(addressessURlRequest);
        const userLiquidityPoolTokensList = poolTokenPairs?.filter((poolTokenPair: TokenPair) => {
          return userTokenBalances.tokens.some(
            (userTokenBalance: MirrorNodeTokenBalance) =>
              userTokenBalance.token_id === poolTokenPair.pairToken.pairLpAccountId
          );
        });
        const poolBalanceUrlRequest = userLiquidityPoolTokensList?.map((pair: TokenPair) => getAllPoolBalanceFor(pair));
        const poolTokenBalances = await Promise.all(poolBalanceUrlRequest);
        const userPoolsMetrics = userLiquidityPoolTokensList?.map((userTokenPair: TokenPair) => {
          const fee = get().pools.allPoolsMetrics.find((pool) => {
            return pool.name === `${userTokenPair.tokenA.symbol}${userTokenPair.tokenB.symbol}`;
          })?.fee;
          const poolTokenBalance = poolTokenBalances.filter(
            (pair) => pair.account === userTokenPair.tokenA.tokenMeta.pairAccountId
          );
          return calculateUserPoolMetrics({
            poolTokenBalances: poolTokenBalance[0],
            userTokenBalances,
            userTokenPair,
            fee,
          });
        });
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.userPoolsMetrics = userPoolsMetrics;
            pools.userTokenBalances = userTokenBalances;
            pools.poolTokenBalances = poolTokenBalances;
          },
          false,
          PoolsActionType.FETCH_USER_POOL_METRICS_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.status = "error";
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.FETCH_USER_POOL_METRICS_FAILED
        );
      }
      app.setFeaturesAsLoaded(["userPoolsMetrics"]);
    },
    fetchSpotPrices: async ({ inputTokenAddress, outputTokenAddress, contractId }: FetchSpotPriceParams) => {
      if (!inputTokenAddress || !outputTokenAddress || !contractId) {
        return;
      }
      const { app, swap } = get();
      set({}, false, PoolsActionType.FETCH_SPOT_PRICES_STARTED);
      app.setFeaturesAsLoading(["spotPrices"]);
      try {
        const { precision } = swap;
        if (precision === undefined) {
          throw Error("Precision not found");
        }
        const spotPriceL49BToL49A = await HederaService.getSpotPrice(contractId);
        const spotPriceL49AToL49B = spotPriceL49BToL49A ? BigNumber(1).dividedBy(spotPriceL49BToL49A) : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceL49AToL49B ? spotPriceL49AToL49B.times(precision) : undefined;
        const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
          ? spotPriceL49BToL49A.dividedBy(precision)
          : undefined;
        set(
          ({ pools }) => {
            pools.spotPrices[`${inputTokenAddress}=>${outputTokenAddress}`] = spotPriceL49AToL49BWithPrecision;
            pools.spotPrices[`${outputTokenAddress}=>${inputTokenAddress}`] = spotPriceL49BToL49AWithPrecision;
          },
          false,
          PoolsActionType.FETCH_SPOT_PRICES_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.FETCH_SPOT_PRICES_FAILED
        );
      }
      app.setFeaturesAsLoaded(["spotPrices"]);
    },
    sendRemoveLiquidityTransaction: async (
      lpTokenSymbol: string,
      lpTokenAmount: number,
      fee: string,
      pairAcoountId: string
    ) => {
      const { context, app, wallet } = get();
      const { network } = context;
      app.setFeaturesAsLoading(["withdrawState"]);
      const provider = WalletService.getProvider(network, wallet.topicID, wallet.savedPairingData?.accountIds[0] ?? "");
      const signer = WalletService.getSigner(provider);
      const lpTokenAmountBigNumber = wallet.getTokenAmountWithPrecision(lpTokenSymbol, lpTokenAmount);

      try {
        set(
          ({ pools }) => {
            pools.withdrawState = {
              status: "in progress",
              successPayload: null,
              errorMessage: "",
            };
            pools.errorMessage = "";
          },
          false,
          PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED
        );
        const result = await HederaService.removeLiquidity(
          signer,
          lpTokenAmountBigNumber,
          ContractId.fromString(pairAcoountId)
        );
        if (result) {
          set(
            ({ pools }) => {
              pools.withdrawState = {
                status: "success",
                successPayload: {
                  lpTokenSymbol,
                  lpTokenAmount,
                  fee,
                  transactionResponse: result,
                },
                errorMessage: "",
              };
              pools.errorMessage = "";
            },
            false,
            PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED
          );
        } else {
          throw new Error("Remove Liquidity Transaction Execution Failed");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.withdrawState = {
              status: "error",
              successPayload: null,
              errorMessage: errorMessage,
            };
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED
        );
      }
      app.setFeaturesAsLoaded(["withdrawState"]);
    },
    resetWithdrawState: async () => {
      set(
        ({ pools }) => {
          pools.withdrawState = initialPoolsStore.withdrawState;
          pools.errorMessage = "";
        },
        false,
        PoolsActionType.RESET_WITHDRAW_STATE
      );
    },
  };
};

export { createPoolsSlice };

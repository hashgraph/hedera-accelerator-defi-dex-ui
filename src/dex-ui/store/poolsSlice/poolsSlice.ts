import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { getErrorMessage } from "../../utils";
import { BigNumber } from "bignumber.js";
import {
  PoolsSlice,
  PoolsStore,
  PoolsState,
  PoolsActionType,
  SendAddLiquidityTransactionParams,
  SendWithdrawTransactionParams,
  SendCreatePoolTransactionParams,
  TokenPair,
  Token,
} from "./types";
import {
  DexService,
  MirrorNodeTokenBalance,
  MirrorNodeTokenByIdResponse,
  MirrorNodeTokenPairResponse,
} from "../../services";
import { calculatePoolMetrics, calculateUserPoolMetrics } from "./utils";
import { isNil } from "ramda";
import { getTimestamp7DaysAgo, getTransactionsFromLast24Hours, isHbarToken } from "../../utils";
import { TransactionStatus } from "../appSlice";

const initialPoolsStore: PoolsState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  poolTokenBalances: [],
  tokenPairs: [],
  userTokenBalances: undefined,
  status: "init",
  errorMessage: null,
  /** Replace with React Query States */
  addLiquidityTransactionState: {
    status: TransactionStatus.INIT,
    successPayload: null,
    errorMessage: "",
  },
  withdrawTransactionState: {
    status: TransactionStatus.INIT,
    successPayload: null,
    errorMessage: "",
  },
  createPoolTransactionState: {
    status: TransactionStatus.INIT,
    successPayload: null,
    errorMessage: "",
  },
};

function getTokenInfoObj(token: MirrorNodeTokenByIdResponse, pair: MirrorNodeTokenPairResponse, fee: BigNumber) {
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

  const tokenAInfoDetails: Token = getTokenInfoObj(tokenAInfo, pairData, fee);
  const tokenBInfoDetails: Token = getTokenInfoObj(tokenBInfo, pairData, fee);

  const lpTokenMeta = {
    symbol: tokenCInfo.data.symbol,
    lpAccountId: lpTokenId,
    totalSupply: tokenCInfo.data.total_supply,
    decimals: tokenCInfo.data.decimals,
  };
  const updated: TokenPair = {
    lpTokenMeta,
    tokenA: tokenAInfoDetails,
    tokenB: tokenBInfoDetails,
  };
  return updated;
};

const metricsForEachPair = async (pair: TokenPair) => {
  const tokenPairBalance = await DexService.fetchAccountTokenBalances(pair.tokenA.tokenMeta.pairAccountId ?? "");
  const timestamp7DaysAgo = getTimestamp7DaysAgo();
  const last7DTransactions = await DexService.fetchAccountTransactions(
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
    poolFee: pair.tokenA.tokenMeta.fee,
  });
};

const getAllPoolBalanceFor = async (pair: TokenPair) => {
  return await DexService.fetchAccountTokenBalances(pair.tokenA.tokenMeta.pairAccountId ?? "");
};

/**
 * @returns
 */
const createPoolsSlice: PoolsSlice = (set, get): PoolsStore => {
  return {
    ...initialPoolsStore,
    sendAddLiquidityTransaction: async ({
      inputToken,
      outputToken,
      contractId,
      transactionDeadline,
    }: SendAddLiquidityTransactionParams) => {
      const { wallet, app } = get();
      const { network } = get().context;
      app.setFeaturesAsLoading(["addLiquidityTransactionState"]);
      const firstTokenAddress = TokenId.fromString(inputToken.address).toSolidityAddress();
      const secondTokenAddress = TokenId.fromString(outputToken.address).toSolidityAddress();
      const firstTokenQuantity = isHbarToken(inputToken.address)
        ? BigNumber(0)
        : wallet.getTokenAmountWithPrecision(inputToken.address, inputToken.amount);
      const secondTokenQuantity = isHbarToken(outputToken.address)
        ? BigNumber(0)
        : wallet.getTokenAmountWithPrecision(outputToken.address, outputToken.amount);
      const addLiquidityContractAddress = ContractId.fromString(contractId);

      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const provider = DexService.getProvider(network, wallet.topicID, signingAccount);
      const signer = DexService.getSigner(provider);

      const tokenAHbarQty = isHbarToken(inputToken.address) ? inputToken.amount : 0.0;
      const tokenBHbarQty = isHbarToken(outputToken.address) ? outputToken.amount : 0.0;
      const HbarAmount = tokenAHbarQty + tokenBHbarQty;

      try {
        set(
          ({ pools }) => {
            pools.addLiquidityTransactionState = {
              status: "in progress",
              successPayload: null,
              errorMessage: "",
            };
            pools.errorMessage = "";
          },
          false,
          PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED
        );
        const result = await DexService.addLiquidity({
          firstTokenAddress,
          firstTokenQuantity,
          secondTokenAddress,
          secondTokenQuantity,
          addLiquidityContractAddress,
          walletAddress,
          transactionDeadline,
          HbarAmount,
          signer,
        });
        if (result) {
          set(
            ({ pools }) => {
              pools.addLiquidityTransactionState = {
                status: "success",
                successPayload: {
                  transactionResponse: result,
                },
                errorMessage: "",
              };
              pools.errorMessage = "";
            },
            false,
            PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED
          );
        } else {
          throw new Error("Add Liquidity Transaction Execution Failed");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.addLiquidityTransactionState = {
              status: "error",
              successPayload: null,
              errorMessage: errorMessage,
            };
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED
        );
      }
      app.setFeaturesAsLoaded(["addLiquidityTransactionState"]);
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
        const pairsAddresses = await DexService.fetchAllTokenPairs();
        const addressesURlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const poolTokenPairs = await Promise.all(addressesURlRequest);
        const addressesURlRequestForMetrics = poolTokenPairs?.map((pair) => metricsForEachPair(pair));
        const allPoolMetrics = await Promise.all(addressesURlRequestForMetrics);
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.tokenPairs = poolTokenPairs;
            pools.allPoolsMetrics = allPoolMetrics;
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
        const userTokenBalances = await DexService.fetchAccountTokenBalances(userAccountId);
        const pairsAddresses = await DexService.fetchAllTokenPairs();
        const addressesURlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const poolTokenPairs = await Promise.all(addressesURlRequest);
        const userLiquidityPoolTokensList = poolTokenPairs?.filter((poolTokenPair: TokenPair) => {
          return userTokenBalances.tokens.some(
            (userTokenBalance: MirrorNodeTokenBalance) =>
              userTokenBalance.token_id === poolTokenPair.lpTokenMeta.lpAccountId
          );
        });
        const poolBalanceUrlRequest = userLiquidityPoolTokensList?.map((pair: TokenPair) => getAllPoolBalanceFor(pair));
        const poolTokenBalances = await Promise.all(poolBalanceUrlRequest);
        const userPoolsMetrics = userLiquidityPoolTokensList?.map((userTokenPair: TokenPair) => {
          const fee = get().pools.allPoolsMetrics.find((pool) => {
            return (
              pool.name === `${userTokenPair.tokenA.symbol}-${userTokenPair.tokenB.symbol}` &&
              pool.fee?.eq(userTokenPair.tokenA.tokenMeta.fee ?? BigNumber(-1))
            );
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
    sendRemoveLiquidityTransaction: async ({
      tokenSymbol,
      lpTokenAmount,
      fee,
      pairAcountId,
      lpAccountId,
      transactionDeadline,
    }: SendWithdrawTransactionParams) => {
      const { context, app, wallet } = get();
      const { network } = context;
      app.setFeaturesAsLoading(["withdrawTransactionState"]);
      const provider = DexService.getProvider(network, wallet.topicID, wallet.savedPairingData?.accountIds[0] ?? "");
      const signer = DexService.getSigner(provider);
      const lpTokenAmountBigNumber = wallet.getTokenAmountWithPrecision(lpAccountId, lpTokenAmount);

      try {
        set(
          ({ pools }) => {
            pools.withdrawTransactionState = {
              status: "in progress",
              successPayload: null,
              errorMessage: "",
            };
            pools.errorMessage = "";
          },
          false,
          PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED
        );

        const result = await DexService.removeLiquidity({
          signer,
          lpTokenAmount: lpTokenAmountBigNumber,
          contractId: ContractId.fromString(pairAcountId),
          transactionDeadline,
        });
        if (result) {
          set(
            ({ pools }) => {
              pools.withdrawTransactionState = {
                status: "success",
                successPayload: {
                  tokenSymbol,
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
            pools.withdrawTransactionState = {
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
      app.setFeaturesAsLoaded(["withdrawTransactionState"]);
    },
    sendCreatePoolTransaction: async (params: SendCreatePoolTransactionParams) => {
      const { wallet, app } = get();
      const { network } = get().context;
      app.setFeaturesAsLoading(["createPoolTransactionState"]);
      const firstTokenAddress = TokenId.fromString(params.firstToken.address).toSolidityAddress();
      const secondTokenAddress = TokenId.fromString(params.secondToken.address).toSolidityAddress();
      const firstTokenQuantity = isHbarToken(params.firstToken.address)
        ? BigNumber(0)
        : wallet.getTokenAmountWithPrecision(params.firstToken.address, params.firstToken.amount);
      const secondTokenQuantity = isHbarToken(params.secondToken.address)
        ? BigNumber(0)
        : wallet.getTokenAmountWithPrecision(params.secondToken.address, params.secondToken.amount);

      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const provider = DexService.getProvider(network, wallet.topicID, signingAccount);
      const signer = DexService.getSigner(provider);

      const tokenAHbarQty = isHbarToken(params.firstToken.address) ? params.firstToken.amount : 0.0;
      const tokenBHbarQty = isHbarToken(params.secondToken.address) ? params.secondToken.amount : 0.0;
      const HbarAmount = tokenAHbarQty + tokenBHbarQty;
      try {
        set(
          ({ pools }) => {
            pools.createPoolTransactionState = {
              status: "in progress",
              successPayload: null,
              errorMessage: "",
            };
            pools.errorMessage = "";
          },
          false,
          PoolsActionType.SEND_CREATE_POOL_TRANSACTION_TO_WALLET_STARTED
        );
        await DexService.createPool({
          firstTokenAddress,
          secondTokenAddress,
          transactionFee: BigNumber(params.transactionFee),
          transactionDeadline: params.transactionDeadline,
          walletAddress,
          signer,
        });

        const newPairAddress = await DexService.getPair(firstTokenAddress, secondTokenAddress, params.transactionFee);
        const pairContractId = ContractId.fromSolidityAddress(newPairAddress);

        const result = await DexService.addLiquidity({
          firstTokenAddress,
          firstTokenQuantity,
          secondTokenAddress,
          secondTokenQuantity,
          transactionDeadline: params.transactionDeadline,
          addLiquidityContractAddress: pairContractId,
          walletAddress,
          HbarAmount,
          signer,
        });
        if (result) {
          set(
            ({ pools }) => {
              pools.createPoolTransactionState = {
                status: "success",
                successPayload: {
                  transactionResponse: result,
                },
                errorMessage: "",
              };
              pools.errorMessage = "";
            },
            false,
            PoolsActionType.SEND_CREATE_POOL_TRANSACTION_TO_WALLET_SUCCEEDED
          );
        } else {
          throw new Error("Create Pool Transaction Execution Failed");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.createPoolTransactionState = {
              status: "error",
              successPayload: null,
              errorMessage: errorMessage,
            };
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.SEND_CREATE_POOL_TRANSACTION_TO_WALLET_FAILED
        );
      }
      app.setFeaturesAsLoaded(["createPoolTransactionState"]);
    },
    resetWithdrawState: async () => {
      set(
        ({ pools }) => {
          pools.withdrawTransactionState = initialPoolsStore.withdrawTransactionState;
          pools.errorMessage = "";
        },
        false,
        PoolsActionType.RESET_WITHDRAW_STATE
      );
    },
    resetAddLiquidityState: async () => {
      set(
        ({ pools }) => {
          pools.addLiquidityTransactionState = initialPoolsStore.addLiquidityTransactionState;
          pools.errorMessage = "";
        },
        false,
        PoolsActionType.RESET_ADD_LIQUIDITY_STATE
      );
    },
    resetCreatePoolState: async () => {
      set(
        ({ pools }) => {
          pools.createPoolTransactionState = initialPoolsStore.createPoolTransactionState;
          pools.errorMessage = "";
        },
        false,
        PoolsActionType.RESET_CREATE_POOL_STATE
      );
    },
  };
};

export { createPoolsSlice };

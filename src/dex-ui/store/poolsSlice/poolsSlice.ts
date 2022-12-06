import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { getErrorMessage } from "../../utils";
import { PoolsSlice, PoolsStore, PoolsState, PoolsActionType, SendAddLiquidityTransactionParams } from "./types";
import {
  MirrorNodeService,
  WalletService,
  HederaService,
  MirrorNodeTokenBalance,
  SWAP_CONTRACT_ID,
  MirrorNodeTransaction,
} from "../../services";

import { calculatePoolMetrics, calculateUserPoolMetrics } from "./utils";
import { isNil } from "ramda";
import { getTimestamp7DaysAgo, getTransactionsFromLast24Hours } from "../../utils";
import { Pool, UserPool } from "./types";

const initialPoolsStore: PoolsState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  poolTokenBalances: [],
  userTokenBalances: [],
  status: "init",
  errorMessage: null,
  withdrawState: {
    status: "init",
    successPayload: null,
    errorMessage: "",
  },
};

interface NewTokenPair {
  tokenA: TokenPairs;
  tokenB: TokenPairs;
  pairToken: {
    symbol: string | undefined;
    accountId: string | undefined;
  };
}
interface TokenPairs {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairContractId: string | undefined;
    tokenId: string | undefined;
  };
}

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
      const firstTokenQuantity = wallet.getTokenAmountWithPrecision(inputToken.symbol, inputToken.amount);
      const secondTokenQuantity = wallet.getTokenAmountWithPrecision(outputToken.symbol, outputToken.amount);
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
        const poolTokenPairs = await HederaService.fetchTokenPairs();
        const poolBalanceUrlRequest: Array<Promise<any>> = [];
        const urlRequest: Array<Promise<any>> = [];
        let copyPoolMetrices: Pool[] | undefined = [];
        poolTokenPairs?.map((tokenPair) =>
          poolBalanceUrlRequest.push(MirrorNodeService.fetchAccountTokenBalances(tokenPair.pairToken.accountId ?? ""))
        );
        const poolTokenBalances: Array<MirrorNodeTokenBalance> = await Promise.all(poolBalanceUrlRequest);
        const newCopy1: Array<MirrorNodeTokenBalance[]> = await Promise.all(poolBalanceUrlRequest);
        // const poolTokenBalances = await MirrorNodeService.fetchAccountTokenBalances(SWAP_CONTRACT_ID);
        const timestamp7DaysAgo = getTimestamp7DaysAgo();

        poolTokenPairs?.map((obj) =>
          urlRequest.push(MirrorNodeService.fetchAccountTransactions(obj.pairToken.accountId ?? "", timestamp7DaysAgo))
        );
        const copylast7DTransactions: Array<Array<MirrorNodeTransaction>> = await Promise.all(urlRequest);
        const poolFee = await HederaService.fetchFeeWithPrecision();

        // TODO: Needs to be updated once fees are unique to each individial pool.

        for (const [i, tokenPair] of poolTokenPairs?.entries() ?? []) {
          const last24Transactions = getTransactionsFromLast24Hours(copylast7DTransactions[i]);
          const last7DTransactions = copylast7DTransactions[i];
          const newCopy = newCopy1[i];
          // const poolTokenBalances = copyPoolTokenBalances[i];
          copyPoolMetrices = [
            ...copyPoolMetrices,
            calculatePoolMetrics({
              poolAccountId: tokenPair.pairToken.accountId ?? "",
              newCopy,
              last24Transactions,
              last7DTransactions,
              tokenPair,
              poolFee,
            }),
          ];
        }

        const allPoolsMetrics = copyPoolMetrices;
        // const allPoolsMetrics = poolTokenPairs?.map((tokenPair: NewTokenPair) => {
        //   return calculatePoolMetrics({
        //     poolAccountId: tokenPair.pairToken.accountId ?? "",
        //     poolTokenBalances,
        //     last24Transactions,
        //     last7DTransactions,
        //     tokenPair,
        //     poolFee,
        //   });
        // });
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.allPoolsMetrics = allPoolsMetrics ?? [];
            pools.poolTokenBalances = poolTokenBalances;
          },
          false,
          PoolsActionType.FETCH_ALL_METRICS_SUCCEEDED
        );
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
        const poolTokenPairs = await HederaService.fetchTokenPairs();
        const userTokenBalances = await MirrorNodeService.fetchAccountTokenBalances(userAccountId);
        const userLiquidityPoolTokensList = poolTokenPairs?.filter((poolTokenPair: NewTokenPair) => {
          return userTokenBalances.some(
            (userTokenBalance: MirrorNodeTokenBalance) =>
              userTokenBalance.token_id === poolTokenPair.pairToken.accountId
          );
        });
        // TODO: Needs to be updated once fees are unique to each individial pool.
        const poolFee = get().pools.allPoolsMetrics[0].fee;
        const userPoolsMetrics = userLiquidityPoolTokensList?.map((userTokenPair: NewTokenPair) => {
          return calculateUserPoolMetrics({
            newCopy: get().pools.poolTokenBalances,
            userTokenBalances,
            userTokenPair,
            fee: poolFee,
          });
        });
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.userPoolsMetrics = userPoolsMetrics ?? [];
            pools.userTokenBalances = userTokenBalances;
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
    sendRemoveLiquidityTransaction: async (lpTokenSymbol: string, lpTokenAmount: number, fee: string) => {
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
        const result = await HederaService.removeLiquidity(signer, lpTokenAmountBigNumber);
        console.log(result);
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
    // Temporary - should be removed
    send100LabTokensToWallet: async (receivingAccountId: string) => {
      const hashconnect = WalletService.getHashconnectInstance();
      const { network } = get().context;
      const walletState = get().wallet;
      await HederaService.get100LABTokens(receivingAccountId, hashconnect, walletState, network);
    },
  };
};

export { createPoolsSlice };

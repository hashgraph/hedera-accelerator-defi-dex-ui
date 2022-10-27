import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { getErrorMessage } from "../../utils";
import { PoolsSlice, PoolsStore, PoolsState, PoolsActionType, SendAddLiquidityTransactionParams } from "./types";
import {
  MirrorNodeService,
  WalletService,
  HederaService,
  MirrorNodeTokenBalance,
  SWAP_CONTRACT_ID,
  TokenPair,
} from "../../services";
import { calculatePoolMetrics, calculateUserPoolMetrics } from "./utils";
import { isNil } from "ramda";
import { getTimestamp7DaysAgo, getTransactionsFromLast24Hours } from "../../utils";

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

/**
 * A hook that provides access to functions that fetch transaction and account
 * information from a Hedera managed mirror node.
 * @returns - The state of the mirror node data as well as functions that can be used to fetch
 * the latest mirror node network data.
 */
const createPoolsSlice: PoolsSlice = (set, get): PoolsStore => {
  return {
    ...initialPoolsStore,
    sendAddLiquidityTransaction: async ({ inputToken, outputToken, contractId }: SendAddLiquidityTransactionParams) => {
      const { walletData, getTokenAmountWithPrecision } = get().wallet;
      const { network } = get().context;
      const firstTokenAddress = TokenId.fromString(inputToken.address).toSolidityAddress();
      const secondTokenAddress = TokenId.fromString(outputToken.address).toSolidityAddress();
      const firstTokenQuantity = getTokenAmountWithPrecision(inputToken.symbol, inputToken.amount);
      const secondTokenQuantity = getTokenAmountWithPrecision(outputToken.symbol, outputToken.amount);
      const addLiquidityContractAddress = ContractId.fromString(contractId);

      const signingAccount = walletData.pairedAccounts[0];
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const provider = WalletService.getProvider(network, walletData.topicID, signingAccount);
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
      set(
        ({ pools }) => {
          pools.status = "fetching";
        },
        false,
        PoolsActionType.FETCH_ALL_POOL_METRICS_STARTED
      );
      try {
        const poolTokenBalances = await MirrorNodeService.fetchAccountTokenBalances(SWAP_CONTRACT_ID);
        const timestamp7DaysAgo = getTimestamp7DaysAgo();
        const last7DTransactions = await MirrorNodeService.fetchAccountTransactions(
          SWAP_CONTRACT_ID,
          timestamp7DaysAgo
        );
        const last24Transactions = getTransactionsFromLast24Hours(last7DTransactions);
        const poolTokenPairs = await MirrorNodeService.fetchTokenPairs();
        // TODO: Needs to be updated once fees are unique to each individial pool.
        const poolFee = await HederaService.fetchFeeWithPrecision();
        const allPoolsMetrics = poolTokenPairs.map((tokenPair: TokenPair) => {
          return calculatePoolMetrics({
            poolAccountId: SWAP_CONTRACT_ID,
            poolTokenBalances,
            last24Transactions,
            last7DTransactions,
            tokenPair,
            poolFee,
          });
        });
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.allPoolsMetrics = allPoolsMetrics;
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
    },
    fetchUserPoolMetrics: async (userAccountId: string) => {
      set(
        ({ pools }) => {
          pools.status = "fetching";
        },
        false,
        PoolsActionType.FETCH_USER_POOL_METRICS_STARTED
      );
      try {
        if (isNil(userAccountId)) {
          throw Error("User Account ID must be defined.");
        }
        const poolTokenPairs = await MirrorNodeService.fetchTokenPairs();
        const userTokenBalances = await MirrorNodeService.fetchAccountTokenBalances(userAccountId);
        const userLiquidityPoolTokensList = poolTokenPairs.filter((poolTokenPair: TokenPair) => {
          return userTokenBalances.some(
            (userTokenBalance: MirrorNodeTokenBalance) =>
              userTokenBalance.token_id === poolTokenPair.pairToken.accountId
          );
        });
        // TODO: Needs to be updated once fees are unique to each individial pool.
        const poolFee = get().pools.allPoolsMetrics[0].fee;
        const userPoolsMetrics = userLiquidityPoolTokensList.map((userTokenPair: TokenPair) => {
          return calculateUserPoolMetrics({
            poolTokenBalances: get().pools.poolTokenBalances,
            userTokenBalances,
            userTokenPair,
            fee: poolFee,
          });
        });
        set(
          ({ pools }) => {
            pools.status = "success";
            pools.userPoolsMetrics = userPoolsMetrics;
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
    },
    sendRemoveLiquidityTransaction: async (lpTokenSymbol: string, lpTokenAmount: number, userPercentOfPool: string) => {
      const { network } = get().context;
      const { walletData, getTokenAmountWithPrecision } = get().wallet;
      const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = WalletService.getSigner(provider);
      const lpTokenAmountBigNumber = getTokenAmountWithPrecision(lpTokenSymbol, lpTokenAmount);

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
                  userPercentOfPool,
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
    },
    resetWithdrawState: async () => {
      set(
        ({ pools }) => {
          pools.withdrawState = {
            status: "init",
            successPayload: null,
            errorMessage: "",
          };
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

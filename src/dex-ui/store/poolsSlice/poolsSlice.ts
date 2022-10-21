import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { BigNumber } from "bignumber.js";
import { getErrorMessage } from "../../utils";
import { PoolsSlice, PoolsStore, PoolsState, PoolsActionType } from "./types";
import {
  MirrorNodeService,
  WalletService,
  HederaService,
  A_B_PAIR_TOKEN_ID,
  MirrorNodeTokenBalance,
  SWAP_CONTRACT_ID,
  TokenPair,
} from "../../services";
import { calculatePoolMetrics, calculateUserPoolMetrics } from "./utils";
import { isNil } from "ramda";
import { getTimestamp7DaysAgo, getTransactionsFromLast24Hours } from "../../utils";

/**
 * TODO: This is mocked data that adds a token pair balance to the primary pool balance data.
 * This should be removed after we can fetch pair tokens from the pool contract.
 * */
const appendLiquidityTokenBalance = (poolTokenBalances: MirrorNodeTokenBalance[]) => {
  const mockedTokenBalance = {
    token_id: A_B_PAIR_TOKEN_ID,
    balance: 1000,
  };
  return poolTokenBalances?.concat(mockedTokenBalance);
};

const initialPoolsStore: PoolsState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  poolTokenBalances: [],
  userTokenBalances: [],
  status: "init",
  errorMessage: null,
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
    sendAddLiquidityTransaction: async ({
      firstTokenAddr,
      firstTokenQty,
      secondTokenAddr,
      secondTokenQty,
      addLiquidityContractAddr,
    }) => {
      const { walletData } = get().wallet;
      const { network } = get().context;
      const firstTokenAddress = TokenId.fromString(firstTokenAddr).toSolidityAddress();
      const secondTokenAddress = TokenId.fromString(secondTokenAddr).toSolidityAddress();
      // TODO: currently can only support whole numbers - remove the floor function when decimal values supported
      const firstTokenQuantity = new BigNumber(Math.floor(firstTokenQty));
      const secondTokenQuantity = new BigNumber(Math.floor(secondTokenQty));
      const addLiquidityContractAddress = ContractId.fromString(addLiquidityContractAddr);

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
        const poolTokenBalances = appendLiquidityTokenBalance(
          await MirrorNodeService.fetchAccountTokenBalances(SWAP_CONTRACT_ID)
        );
        const timestamp7DaysAgo = getTimestamp7DaysAgo();
        const last7DTransactions = await MirrorNodeService.fetchAccountTransactions(
          SWAP_CONTRACT_ID,
          timestamp7DaysAgo
        );
        const last24Transactions = getTransactionsFromLast24Hours(last7DTransactions);
        const poolTokenPairs = await MirrorNodeService.fetchTokenPairs();
        const poolFee = await MirrorNodeService.fetchPoolFee();
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
        const userPoolsMetrics = userLiquidityPoolTokensList.map((userTokenPair: TokenPair) => {
          return calculateUserPoolMetrics({
            poolTokenBalances: get().pools.poolTokenBalances,
            userTokenBalances,
            userTokenPair,
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
    sendRemoveLiquidityTransaction: async (lpTokenAmount: number) => {
      const { network } = get().context;
      const { walletData } = get().wallet;
      const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = WalletService.getSigner(provider);

      try {
        set({}, false, PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED);
        const result = await HederaService.removeLiquidity(signer, lpTokenAmount);
        console.log(result);
        if (result) {
          set({}, false, PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED);
        } else {
          throw new Error("Remove Liquidity Transaction Execution Failed");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ pools }) => {
            pools.errorMessage = errorMessage;
          },
          false,
          PoolsActionType.SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED
        );
      }
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

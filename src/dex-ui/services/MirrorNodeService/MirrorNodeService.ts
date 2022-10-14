import axios from "axios";
import { isNil, path } from "ramda";
import { A_B_PAIR_TOKEN_ID, TOKEN_A_SYMBOL, TOKEN_B_SYMBOL, TOKEN_A_ID, TOKEN_B_ID } from "../constants";
import {
  MirrorNodeAccountBalance,
  MirrorNodeBalanceResponse,
  MirrorNodeTokenBalance,
  MirrorNodeTransaction,
  TokenPair,
} from "./types";

const TESTNET_URL = `https://testnet.mirrornode.hedera.com`;
/* TODO: Enable for Mainnet usage.
  const MAINNET_URL = `https://mainnet-public.mirrornode.hedera.com`;
  */
const testnetMirrorNodeAPI = axios.create({
  baseURL: TESTNET_URL,
});
/* TODO: Enable for Mainnet usage.
  const mainnetMirrorNodeAPI = axios.create({
    baseURL: MAINNET_URL
  });
  */

const GREATER_THAN = "gte";

type MirrorNodeServiceType = ReturnType<typeof createMirrorNodeService>;
/**
 * A hook that provides access to functions that fetch transaction and account
 * information from a Hedera managed mirror node.
 * @returns - The state of the mirror node data as well as functions that can be used to fetch
 * the latest mirror node network data.
 */
function createMirrorNodeService() {
  /**
   * Continues to call a mirror node endpoint to fetch subsiquent batches of data until all query data is
   * retrieved. The Mirror Node API is limited to returning a maximum of 100 records. When there are additional
   * records to retrieve, the Mirror Node endpoint returns a URL (under the field link.next) that can be called
   * to retrieve the next batch of data.
   * @param nextUrl - The URL to call to get the next batch of Mirror Node data.
   * @param field - The response.data field to extract the returned data from.
   * @returns The aggregate list of data gathered from the Mirror Node API calls.
   */
  const fetchNextBatch = async <T>(nextUrl: string, field: string, config: any = {}): Promise<T[]> => {
    const response = await testnetMirrorNodeAPI.get(nextUrl, config);
    const { links } = response.data;
    const dataBatch = path<T[]>([field], response.data) ?? [];
    const isMoreData = !isNil(links.next);
    if (isMoreData) {
      return [...dataBatch, ...(await fetchNextBatch<T>(links.next, field))];
    }
    return dataBatch;
  };

  /**
   * Fetches a list of previously executed Hedera network transactions associated with an
   * account ID up to a given point in time.
   * @param accountId - The ID of the account to return transactions for.
   * @param timestamp - The latest point in the past to return transactions from.
   * @returns The list of transactions for the given account ID with a consensus timestamp greater than the
   * provided timestamp.
   */
  const fetchAccountTransactions = async (accountId: string, timestamp?: string): Promise<MirrorNodeTransaction[]> => {
    const params = {
      "account.id": accountId,
      order: "desc",
      transactiontype: "CRYPTOTRANSFER",
      result: "success",
      limit: 100,
    };

    if (!isNil(timestamp)) {
      Object.assign(params, { timestamp: `${GREATER_THAN}:${timestamp}` });
    }

    return await fetchNextBatch("/api/v1/transactions", "transactions", { params });
  };

  /**
   * TODO: This is mocked data and should be replaced with a mirror node call to fetch
   * all pairs associated with the primary swap/pool contract.
   */
  const fetchTokenPairs = async (): Promise<TokenPair[]> => {
    // getTokenPairAddress()
    return await Promise.resolve([
      {
        pairToken: { symbol: "A-B", accountId: A_B_PAIR_TOKEN_ID },
        tokenA: { symbol: TOKEN_A_SYMBOL, accountId: TOKEN_A_ID },
        tokenB: { symbol: TOKEN_B_SYMBOL, accountId: TOKEN_B_ID },
      },
    ]);
  };

  /**
   * Fetches the HBAR balance and a list of token balances on the Hedera
   * network for the given account ID.
   * @param accountId - The ID of the account to return balances for.
   * @returns The list of balances for the given account ID.
   */
  const fetchAccountBalances = async (accountId: string): Promise<MirrorNodeAccountBalance[]> => {
    return await fetchNextBatch(`/api/v1/balances`, "balances", {
      params: {
        "account.id": accountId,
        order: "asc",
        limit: 100,
      },
    });
  };

  /**
   * UPDATE THIS TSDOC
   *
   *
   *
   *
   * Fetches the HBAR balance and a list of token balances on the Hedera
   * network for the given account ID.
   * @param accountId - The ID of the account to return token balances for.
   * @returns The list of balances for the given account ID.
   */
  const fetchAccountTokenBalances = async (accountId: string): Promise<MirrorNodeTokenBalance[]> => {
    const accountBalances = await fetchAccountBalances(accountId);
    return accountBalances.flatMap((accountBalance) => accountBalance.tokens);
  };

  /**
   * Fetches the list of token balances given a token ID. This represents
   * the Token supply distribution across the network
   * @param tokenId - The ID of the token to return balances for.
   * @returns The list of balances for the given token ID.
   */
  const fetchTokenBalances = async (tokenId: string): Promise<MirrorNodeBalanceResponse> => {
    return await testnetMirrorNodeAPI.get(`/api/v1/tokens/${tokenId}/balances`, {
      params: {
        order: "asc",
      },
    });
  };

  return {
    fetchAccountTransactions,
    fetchTokenPairs,
    fetchAccountTokenBalances,
    fetchTokenBalances,
    fetchAccountBalances,
  };
}

export { createMirrorNodeService };
export type { MirrorNodeServiceType };

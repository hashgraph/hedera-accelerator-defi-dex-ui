import axios from "axios";
import { isNil } from "ramda";
import { A_B_PAIR_TOKEN_ID, L49A_TOKEN_ID, L49B_TOKEN_ID } from "../constants";
import { TokenPair } from "./types";

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

const fetchNextBatch = async (nextUrl: string, field: string, config: any = {}): Promise<any[]> => {
  const response = await testnetMirrorNodeAPI.get(nextUrl, config);
  const { links } = response.data;
  const isMoreData = !isNil(links.next);
  if (isMoreData) {
    return [...response.data[field], ...(await fetchNextBatch(links.next, field))];
  }
  return response.data[field];
};

/** */
const fetchAccountTransactions = async (accountId: string, timestamp?: string) => {
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

// TODO: This should be replaced with a mirror call to fetch all pairs associated with the primary swap/pool contract.
const fetchTokenPairs = async (): Promise<TokenPair[]> => {
  return await Promise.resolve([
    {
      pairToken: { symbol: "A-B", accountId: A_B_PAIR_TOKEN_ID },
      tokenA: { symbol: "L49A", accountId: L49A_TOKEN_ID },
      tokenB: { symbol: "L49B", accountId: L49B_TOKEN_ID },
    },
  ]);
};

/**
 * Fetches the HBAR balance and a list of token balances on the Hedera
 * network for the given account ID.
 * @param accountId - The ID of the account to return balances for.
 * @returns - The list of balances for the given account ID.
 */
const fetchAccountBalances = async (accountId: string) => {
  return await fetchNextBatch(`/api/v1/balances`, "balances", {
    params: {
      "account.id": accountId,
      order: "asc",
      limit: 100,
    },
  });
};

/**
 * Fetches the list of token balances given a token ID. This represents
 * the Token supply distribution across the network
 * @param tokenId - The ID of the token to return balances for.
 * @returns - The list of balances for the given token ID.
 */
const fetchTokenBalances = async (tokenId: string) => {
  return await testnetMirrorNodeAPI.get(`/api/v1/tokens/${tokenId}/balances`, {
    params: {
      order: "asc",
    },
  });
};

export { fetchAccountTransactions, fetchTokenPairs, fetchTokenBalances, fetchAccountBalances };

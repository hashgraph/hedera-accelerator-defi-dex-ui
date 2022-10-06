import axios from "axios";
import { isNil } from "ramda";
import { L49A_TOKEN_ID, L49B_TOKEN_ID } from "../constants";
import { TokenPair } from "./types";

const TESTNET_URL = `https://testnet.mirrornode.hedera.com`;
// const MAINNET_URL = `https://mainnet-public.mirrornode.hedera.com`;
const GREATER_THAN = "gte";

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
  return await axios.get(`${TESTNET_URL}/api/v1/transactions`, {
    params,
  });
};

// TODO: This should be replaced with a mirror call to fetch all pairs associated with the primary swap/pool contract.
const fetchTokenPairs = async (): Promise<TokenPair[]> => {
  return await Promise.resolve([
    { tokenA: { symbol: "L49A", accountId: L49A_TOKEN_ID }, tokenB: { symbol: "L49B", accountId: L49B_TOKEN_ID } },
  ]);
};

/**
 * Fetches the HBAR balance and a list of token balances on the Hedera
 * network for the given account ID.
 * @param accountId - The ID of the account to return balances for.
 * @returns - The list of balances for the given account ID.
 */
const fetchAccountBalances = async (accountId: string) => {
  return await axios.get(`${TESTNET_URL}/api/v1/balances`, {
    params: {
      "account.id": accountId,
      order: "asc",
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
  return await axios.get(`${TESTNET_URL}/api/v1/tokens/${tokenId}/balances`, {
    params: {
      order: "asc",
    },
  });
};

export { fetchAccountTransactions, fetchTokenPairs, fetchTokenBalances, fetchAccountBalances };

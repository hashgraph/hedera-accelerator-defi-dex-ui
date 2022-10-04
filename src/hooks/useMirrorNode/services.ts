import axios from "axios";

const TESTNET_URL = `https://testnet.mirrornode.hedera.com`;
const MAINNET_URL = `https://mainnet-public.mirrornode.hedera.com`;

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
      // limit
      // timestamp
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
      // limit
      // timestamp
    },
  });
};

export { fetchTokenBalances, fetchAccountBalances };

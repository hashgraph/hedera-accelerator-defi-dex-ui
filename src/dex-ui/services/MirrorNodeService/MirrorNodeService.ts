import axios from "axios";
import Web3 from "web3";
import { BigNumber } from "bignumber.js";
import { isNil, path } from "ramda";
import {
  A_B_PAIR_TOKEN_ID,
  TOKEN_A_SYMBOL,
  TOKEN_B_SYMBOL,
  TOKEN_A_ID,
  TOKEN_B_ID,
  PAIR_TOKEN_SYMBOL,
} from "../constants";
import {
  MirrorNodeTokenByIdResponse,
  MirrorNodeAccountBalance,
  MirrorNodeBalanceResponse,
  MirrorNodeTokenBalance,
  MirrorNodeTransaction,
  TokenPair,
  MirrorNodeProposalEventLog,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenPairResponse,
} from "./types";
import govenorAbi from "../abi/GovernorCountingSimpleInternal.json";

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
 * @returns The state of the mirror node data as well as functions that can be used to fetch
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
   * TODO: This is mocked data and should be replaced with a Hedera Service call to fetch
   * all pairs associated with the primary swap/pool contract.
   */
  const fetchTokenPairs = async (): Promise<TokenPair[]> => {
    // TODO: getTokenPairAddress()
    return await Promise.resolve([
      {
        pairToken: { symbol: PAIR_TOKEN_SYMBOL, accountId: A_B_PAIR_TOKEN_ID },
        tokenA: { symbol: TOKEN_A_SYMBOL, accountId: TOKEN_A_ID },
        tokenB: { symbol: TOKEN_B_SYMBOL, accountId: TOKEN_B_ID },
      },
    ]);
  };

  /**
   * Fetches information related to a specific pair pair token.
   * @param pairAddress  - The ID / Addresss of the pair token account to return data for.
   * @returns Attributes associated with the provided token ID.
   */
  const fetchTokenPairsContract = async (pairAddress: string): Promise<MirrorNodeTokenPairResponse> => {
    return await testnetMirrorNodeAPI.get(`/api/v1/contracts/${pairAddress}`);
  };

  /**
   * Fetches information related to a specific token.
   * @param tokenId  - The ID of the token account to return data for.
   * @returns Attributes associated with the provided token ID.
   */
  const fetchTokenData = async (tokenId: string): Promise<MirrorNodeTokenByIdResponse> => {
    return await testnetMirrorNodeAPI.get(`/api/v1/tokens/${tokenId}`);
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
   * Fetches the HBAR balance and a list of token balances on the Hedera
   * network for the given account ID. Fetches the decimal precision value for
   * each token ID and formats the balances with the correct decimal positions.
   * @param accountId - The ID of the account to return token balances for.
   * @returns The list of balances (in decimal format) for the given account ID.
   */
  const fetchAccountTokenBalances = async (accountId: string): Promise<MirrorNodeTokenBalance[]> => {
    const accountBalances = await fetchAccountBalances(accountId);
    const accountTokens = accountBalances.flatMap((accountBalance) => accountBalance.tokens);
    return await Promise.all(
      accountTokens.map(async (token) => {
        const tokenData = await fetchTokenData(token.token_id);
        const { decimals } = tokenData.data;
        const balance = BigNumber(token.balance).shiftedBy(-Number(decimals));
        return {
          ...token,
          balance,
          decimals: String(decimals),
        };
      })
    );
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

  /**
   * Decodes event contents using the ABI definition of the event.
   * @param eventName - the name of the event.
   * @param logData - log data as a Hex string.
   * @param topics - an array of event topics.
   */
  const decodeEvent = (eventName: string, logData: string, topics: string[]) => {
    const web3 = new Web3();
    const abi = govenorAbi.abi;
    const eventAbi = abi.find((event: any) => event.name === eventName && event.type === "event");
    if (eventAbi?.inputs === undefined) {
      return undefined;
    }
    try {
      const decodedLog = web3.eth.abi.decodeLog(eventAbi?.inputs, logData, topics);
      return decodedLog;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  /**
   * Fetches all proposal events emitted by a smart contract. The "ProposalCreated",
   * "ProposalExecuted", and "ProposalCanceled" are fetched. These events provide data
   * regarding the contract proposals.
   * @param contractId - The id of the contract to fetch events from.
   * @returns An array of proposal event data.
   */
  const fetchAllProposals = async (contractId: string): Promise<MirrorNodeDecodedProposalEvent[]> => {
    /*
     Currently, each proposal requires multiple additional calls to the smart contract
     to get all of the desired data for the UI. This is an expensive action that costs a large
     amount of hbar. We are only fetching the latest proposal for the time being to reduce
     the query overhead. A solution is being built on the smart contract to enable a single
     query to get all proposal data.

     const response = await fetchNextBatch<{ logs: [] }>(
      `/api/v1/contracts/${contractId.toString()}/results/logs`,
      "logs",
      {
        params: {
          order: "desc",
        },
      }
    );
    */
    const response = await testnetMirrorNodeAPI.get(`/api/v1/contracts/${contractId.toString()}/results/logs`, {
      params: {
        order: "desc",
        limit: 3,
      },
    });
    const proposals: MirrorNodeDecodedProposalEvent[] = response.data.logs
      .flatMap((proposalEventLog: MirrorNodeProposalEventLog) => {
        console.log(proposalEventLog);
        if (proposalEventLog.data === "0x") {
          return undefined;
        }
        return [
          decodeEvent("ProposalCreated", proposalEventLog.data, proposalEventLog.topics.slice(1)),
          // decodeEvent("ProposalExecuted", proposalEventLog.data, proposalEventLog.topics.slice(1)),
          // decodeEvent("ProposalCanceled", proposalEventLog.data, proposalEventLog.topics.slice(1)),
        ];
      })
      .filter((proposal: MirrorNodeDecodedProposalEvent | undefined) => proposal !== undefined);
    return proposals;
  };

  /**
   * Fetchs information about a specific blockNumber.
   * @param blockNumber - The block number to query.
   * @returns Information about the block.
   */
  const fetchBlock = async (blockNumber: string) => {
    const block = await testnetMirrorNodeAPI.get(`/api/v1/blocks/${blockNumber}`);
    return block.data;
  };

  return {
    fetchAccountTransactions,
    fetchTokenPairs,
    fetchAccountTokenBalances,
    fetchTokenBalances,
    fetchAccountBalances,
    fetchAllProposals,
    fetchBlock,
    fetchTokenPairsContract,
  };
}

export { createMirrorNodeService };
export type { MirrorNodeServiceType };

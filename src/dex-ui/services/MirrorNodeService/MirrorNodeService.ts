import axios from "axios";
import { isNil, path } from "ramda";
import {
  MirrorNodeTokenById,
  MirrorNodeAccountBalance,
  MirrorNodeBalanceResponse,
  MirrorNodeTransaction,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenPairResponse,
  MirrorNodeEventLog,
  MirrorNodeAccountById,
} from "./types";
import { ethers } from "ethers";
import { LogDescription } from "ethers/lib/utils";
import { AccountId } from "@hashgraph/sdk";
import { abiSignatures } from "./constants";
import { decodeLog } from "./utils";

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
   * Fetches information related to a specific pair token.
   * @param pairAddress  - The ID / Addresss of the pair token account to return data for.
   * @returns Attributes associated with the provided token ID.
   */
  const fetchContract = async (pairAddress: string): Promise<MirrorNodeTokenPairResponse> => {
    return await testnetMirrorNodeAPI.get(`/api/v1/contracts/${pairAddress}`);
  };

  /**
   * Fetches information related to a specific token.
   * @param tokenId  - The ID of the token account to return data for.
   * @returns Attributes associated with the provided token ID.
   */
  const fetchTokenData = async (tokenId: string): Promise<MirrorNodeTokenById> => {
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
      },
    });
  };

  interface CallContractParams {
    block?: string;
    data: string;
    estimate?: boolean;
    from: string;
    gas?: number;
    gasPrice?: number;
    to: string;
    value?: number;
  }
  /**
   * Returns the results from a cost-free contract execution such as read-only smart contract queries,
   * gas estimation, and transient simulation of read-write operations.
   * @param payload -
   * @returns Results from a cost-free EVM call to the contract.
   */
  async function callContract<Response>(payload: CallContractParams): Promise<Response> {
    const { block, data, estimate, from, gas, gasPrice, to, value } = payload;
    return testnetMirrorNodeAPI.post(`/api/v1/contracts/call`, {
      block,
      data,
      estimate,
      from: AccountId.fromString(from).toSolidityAddress(),
      gas,
      gasPrice,
      to: AccountId.fromString(to).toSolidityAddress(),
      value,
    });
  }

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
   * Fetchs information about a specific blockNumber.
   * @param blockNumber - The block number to query.
   * @returns Information about the block.
   */
  const fetchBlock = async (blockNumber: string) => {
    const block = await testnetMirrorNodeAPI.get(`/api/v1/blocks/${blockNumber}`);
    return block.data;
  };

  async function fetchParsedEventLogs(
    accountId: string,
    contractInterface: ethers.utils.Interface,
    events?: string[]
  ): Promise<ethers.utils.LogDescription[]> {
    const shouldParseAllEvents = isNil(events) || events.length === 0;
    const logs: MirrorNodeEventLog[] = await fetchNextBatch(`/api/v1/contracts/${accountId}/results/logs`, "logs", {
      params: {
        order: "desc",
      },
    });
    const parsedEventLogs: LogDescription[] = logs.reduce((logs: LogDescription[], log: MirrorNodeEventLog) => {
      try {
        const parsedLog = contractInterface.parseLog({ data: log.data, topics: log.topics });
        if (shouldParseAllEvents || events?.includes(parsedLog.name)) {
          return logs.concat(parsedLog);
        } else {
          return logs;
        }
      } catch (e) {
        return logs;
      }
    }, []);
    return parsedEventLogs;
  }

  // TODO: Move to Governance Service
  const fetchContractProposalEvents = async (
    proposalType: string,
    contractId: string
  ): Promise<MirrorNodeDecodedProposalEvent[]> => {
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
        /**
         * Every proposal fetched from the mirror node logs requires an additional hashio
         * JSON RPC call to fetch the remaining details for the UI. Some of these calls are failing
         * with a "HBAR rate limit exceeded" error resulting in the UI displaying an error. This is due to
         * our queries exceeding the global rate limit for the JSON RPC service.
         *
         * To reduce the frequency at which this error occurs a temporary limit has been put in place. A
         * max of 5 proposal details for each type of proposal will be fetched from the proposal logs.
         *
         * @see {@link file://./../../../../architecture/05_Event_Based_Historical_Queries.md} for more details
         * regarding a long term solution.
         */
        limit: 5,
      },
    });

    const allEvents = decodeLog(abiSignatures, response.data.logs, ["ProposalDetails"]);
    const proposalCreatedEvents = allEvents.get("ProposalDetails") ?? [];
    const proposals: MirrorNodeDecodedProposalEvent[] = proposalCreatedEvents.map((item: any) => {
      return { ...item, contractId, type: proposalType };
    });
    return proposals;
  };

  const fetchAccountInfo = async (accountAddress: string): Promise<MirrorNodeAccountById> => {
    const { data: accountData } = await testnetMirrorNodeAPI.get(`/api/v1/accounts/${accountAddress}`);
    return accountData;
  };

  return {
    fetchAccountTransactions,
    fetchTokenBalances,
    fetchAccountBalances,
    fetchBlock,
    fetchContract,
    fetchTokenData,
    callContract,
    fetchParsedEventLogs,
    fetchAccountInfo,
    // TODO: Decouple from MirrorNodeService and move to GovernanceService
    fetchContractProposalEvents,
  };
}

export { createMirrorNodeService };
export type { MirrorNodeServiceType };

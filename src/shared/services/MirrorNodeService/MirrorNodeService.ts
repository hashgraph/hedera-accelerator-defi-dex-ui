import axios from "axios";
import { isNil, path, uniqBy } from "ramda";
import {
  MirrorNodeTokenById,
  MirrorNodeAccountBalance,
  MirrorNodeBalanceResponse,
  MirrorNodeTransaction,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenPairResponse,
  MirrorNodeEventLog,
  MirrorNodeAccountById,
  MirrorNodeBlocks,
  MirrorNodeProposalEventLog,
  MirrorNodeTokenBalance,
  MirrorNodeTokenNFTResponse,
} from "./types";
import { ethers } from "ethers";
import { LogDescription } from "ethers/lib/utils";
import { ContractId } from "@hashgraph/sdk";
import { abiSignatures } from "./constants";
import { decodeLog } from "./utils";
import { Gas, GasPrice } from "@dex/services";
import { getDefaultLedgerId } from "shared";

const mirrorNodeRPCUrls = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
};

const nodeAPIs = {
  mainnet: axios.create({
    baseURL: mirrorNodeRPCUrls.mainnet,
  }),
  testnet: axios.create({
    baseURL: mirrorNodeRPCUrls.testnet,
  }),
  previewnet: axios.create({
    baseURL: mirrorNodeRPCUrls.testnet,
  }),
};

const GREATER_THAN = "gte";

const DEX_PRECISION_DEFAULT = 1e8;

type MirrorNodeServiceType = ReturnType<typeof createMirrorNodeService>;

type Networks = "mainnet" | "testnet" | "previewnet";

type FetchParams = { network: Networks };

/**
 * A hook that provides access to functions that fetch transaction and account
 * information from a Hedera managed mirror node.
 * @returns The state of the mirror node data as well as functions that can be used to fetch
 * the latest mirror node network data.
 */
function createMirrorNodeService(
  params: FetchParams = {
    network: getDefaultLedgerId() as unknown as Networks,
  }
) {
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
    const response = await nodeAPIs[params.network].get(nextUrl, config);
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
    return await nodeAPIs[params.network].get(`/api/v1/contracts/${pairAddress}`);
  };

  const fetchContractId = async (pairAddress: string): Promise<ContractId> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/accounts/${pairAddress}`);
    return ContractId.fromString(response.data.account);
  };

  const fetchContractEVMAddress = async (pairAddress: string): Promise<string> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/contracts/${pairAddress}`);
    return response.data.evm_address;
  };

  /**
   * Fetches information related to a specific token.
   * @param tokenId  - The ID of the token account to return data for.
   * @returns Attributes associated with the provided token ID.
   */
  const fetchTokenData = async (tokenId: string): Promise<MirrorNodeTokenById> => {
    try {
      const response: MirrorNodeTokenById = await nodeAPIs[params.network].get(`/api/v1/tokens/${tokenId}`);
      const precision = Number(response.data?.decimals) ** 10;

      return { data: { ...response.data, precision: precision === 0 ? DEX_PRECISION_DEFAULT : precision } };
    } catch (err) {
      return {
        data: {
          precision: DEX_PRECISION_DEFAULT,
          decimals: "0",
        },
      } as MirrorNodeTokenById;
    }
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

  /**
   * Fetches a list of token balances on the Hedera
   * network for the given account ID.
   * @param accountId - The ID of the account to return balances for.
   * @returns The list of balances for the given account ID.
   */
  const fetchTokensBalance = async (accountId: string): Promise<MirrorNodeTokenBalance[]> => {
    return await fetchNextBatch(`/api/v1/accounts/${accountId}/tokens`, "tokens", {
      params: {
        order: "desc",
        limit: 100,
      },
    });
  };

  interface CallContractParams {
    block?: string;
    data: string;
    estimate?: boolean;
    from?: string;
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

  const callContract = async (payload: CallContractParams): Promise<any> => {
    const { block = "latest", data, estimate = false, from, gas = Gas, gasPrice = GasPrice, to, value = 0 } = payload;
    return await nodeAPIs[params.network].post(`/api/v1/contracts/call`, {
      block,
      data,
      estimate,
      from,
      gas,
      gasPrice,
      to,
      value,
    });
  };

  /**
   * Fetches the list of token balances given a token ID. This represents
   * the Token supply distribution across the network
   * @param tokenId - The ID of the token to return balances for.
   * @returns The list of balances for the given token ID.
   */
  const fetchTokenBalances = async (tokenId: string): Promise<MirrorNodeBalanceResponse> => {
    return await nodeAPIs[params.network].get(`/api/v1/tokens/${tokenId}/balances`, {
      params: {
        order: "asc",
      },
    });
  };

  /**
   * Fetches the list of nfts associated with a token ID for a given account ID
   * @param tokenId - The ID of the token to return NFTs for.
   * @returns The list of NFTs for the given token ID.
   */
  const fetchTokenNFTs = async (tokenId: string, accountId: string): Promise<MirrorNodeTokenNFTResponse> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/tokens/${tokenId}/nfts`, {
      params: {
        order: "asc",
        "account.id": accountId,
      },
    });
    return response.data;
  };

  /**
   * Fetchs information about a specific blockNumber.
   * @param blockNumber - The block number to query.
   * @returns Information about the block.
   */
  const fetchBlock = async (blockNumber: string) => {
    const block = await nodeAPIs[params.network].get(`/api/v1/blocks/${blockNumber}`);
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
  const fetchContractProposalEvents = async (contractId: string): Promise<MirrorNodeDecodedProposalEvent[]> => {
    const response: MirrorNodeProposalEventLog[] = await fetchNextBatch(
      `/api/v1/contracts/${contractId.toString()}/results/logs`,
      "logs",
      {
        params: {
          order: "desc",
        },
      }
    );
    const allEvents = decodeLog(abiSignatures, response, [
      "ProposalCoreInformation",
      "ProposalVotingInformation",
      "VoteCast",
    ]);
    const proposalCreatedEvents = allEvents.get("ProposalCoreInformation") ?? [];
    const proposalVotingEvents = allEvents.get("ProposalVotingInformation") ?? [];
    const voterListEvents = allEvents.get("VoteCast") ?? [];
    const proposals: MirrorNodeDecodedProposalEvent[] = proposalCreatedEvents.map((item: any) => {
      const votingInformation = proposalVotingEvents.find((e) => e.proposalId === item.proposalId).votingInformation;
      const votersList = voterListEvents.filter((e) => e.proposalId === item.proposalId);
      return { ...item, contractId, proposalId: `${item.proposalId}`, votingInformation, votersList };
    });

    const uniqueProposals = uniqBy((proposal: MirrorNodeDecodedProposalEvent) => proposal.proposalId, proposals);
    return uniqueProposals;
  };

  const fetchUpgradeContractEvents = async (
    contractId: string,
    events: string[]
  ): Promise<Map<string, any[]> | undefined> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/contracts/${contractId.toString()}/results/logs`, {
      params: {
        order: "desc",
      },
    });

    return decodeLog(abiSignatures, response.data.logs, events);
  };

  const fetchContractLogs = async (contractId: string): Promise<any> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/contracts/${contractId.toString()}/results/logs`, {
      params: {
        order: "desc",
      },
    });

    return response.data.logs;
  };

  const fetchAccountInfo = async (accountAddress: string): Promise<MirrorNodeAccountById> => {
    const { data: accountData } = await nodeAPIs[params.network].get(`/api/v1/accounts/${accountAddress}`);
    return accountData;
  };

  /**
   * Fetches transaction details / records on Hedera network for a given TransactionId
   * @param transactionId - The ID of the transactions.
   * @returns The list of transactions for the given associated with given TransactionId
   */
  const fetchTransactionRecord = async (transactionId: string): Promise<MirrorNodeTransaction[]> => {
    const { data: transactions } = await nodeAPIs[params.network].get(`/api/v1/transactions/${transactionId}`);
    return transactions.transactions;
  };

  const fetchLatestBlockNumber = async (timestamp: string): Promise<MirrorNodeBlocks[]> => {
    const response = await nodeAPIs[params.network].get("/api/v1/blocks", {
      params: {
        order: "desc",
        timestamp: `gte:${timestamp}`,
        limit: 1,
      },
    });
    const { blocks } = response.data;
    return blocks;
  };

  const fetchLatestContractId = async (pairAddress: string): Promise<ContractId> => {
    const response = await nodeAPIs[params.network].get(`/api/v1/contracts/${pairAddress}`);
    return ContractId.fromString(response.data.contract_id);
  };

  return {
    fetchAccountTransactions,
    fetchTokenBalances,
    fetchAccountBalances,
    fetchBlock,
    fetchContract,
    fetchContractId,
    fetchTokenData,
    callContract,
    fetchParsedEventLogs,
    fetchAccountInfo,
    fetchTransactionRecord,
    fetchLatestBlockNumber,
    fetchLatestContractId,
    fetchTokensBalance,
    // TODO: Decouple from MirrorNodeService and move to GovernanceService
    fetchContractProposalEvents,
    fetchUpgradeContractEvents,
    fetchTokenNFTs,
    fetchContractEVMAddress,
    fetchContractLogs,
  };
}

export { createMirrorNodeService };
export type { MirrorNodeServiceType };

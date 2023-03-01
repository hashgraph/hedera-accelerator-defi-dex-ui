import axios from "axios";
import Web3 from "web3";
import { BigNumber } from "bignumber.js";
import { isNil, path } from "ramda";
import { Contracts, DEX_TOKEN_PRECISION_VALUE } from "../constants";
import {
  MirrorNodeTokenByIdResponse,
  MirrorNodeAccountBalance,
  MirrorNodeBalanceResponse,
  MirrorNodeTransaction,
  MirrorNodeProposalEventLog,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenPairResponse,
} from "./types";
import { ProposalType } from "../../store/governanceSlice";
import { governorAbiSignatureMap } from "./constants";
import { getFulfilledResultsData } from "./utils";

const web3 = new Web3();

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
  const fetchAccountTokenBalances = async (accountId: string): Promise<MirrorNodeAccountBalance> => {
    const accountBalances = await fetchAccountBalances(accountId);
    const account = accountBalances.filter((accountDetails) => accountDetails.account === accountId)[0];
    const tokenBalances = await Promise.all(
      account.tokens.map(async (token) => {
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
    return {
      account: accountId,
      tokens: tokenBalances,
      balance: BigNumber(account.balance).shiftedBy(-Number(DEX_TOKEN_PRECISION_VALUE)),
    };
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

  function decodeLog(signatureMap: Map<string, any>, logs: MirrorNodeProposalEventLog[]) {
    const eventsMap = new Map<string, any[]>();
    for (const log of logs) {
      try {
        const data = log.data;
        const topics = log.topics;
        const timeStamp = log.timestamp;
        const eventAbi = signatureMap.get(topics[0]);
        if (eventAbi !== undefined && eventAbi.name === "ProposalDetails") {
          const requiredTopics = eventAbi.anonymous === true ? topics : topics.splice(1);
          const event = web3.eth.abi.decodeLog(eventAbi.inputs, data, requiredTopics);
          event["timestamp"] = timeStamp;
          const events = eventsMap.get(eventAbi.name) ?? [];
          eventsMap.set(eventAbi.name, [...events, event]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return eventsMap;
  }

  const fetchContractProposalEvents = async (
    proposalType: string,
    contractId: string
  ): Promise<MirrorNodeDecodedProposalEvent[]> => {
    const response = await fetchNextBatch<MirrorNodeProposalEventLog>(
      `/api/v1/contracts/${contractId.toString()}/results/logs`,
      "logs",
      {
        params: {
          order: "desc",
        },
      }
    );

    const allEvents = decodeLog(governorAbiSignatureMap, response);
    const proposalCreatedEvents = allEvents.get("ProposalDetails") ?? [];
    const proposals: MirrorNodeDecodedProposalEvent[] = proposalCreatedEvents.map((item: any) => {
      return { ...item, contractId, type: proposalType };
    });
    return proposals;
  };

  /**
   * Fetches all proposal events emitted by a smart contract. The "ProposalCreated",
   * "ProposalExecuted", and "ProposalCanceled" are fetched. These events provide data
   * regarding the contract proposals.
   * @param contractId - The id of the contract to fetch events from.
   * @returns An array of proposal event data.
   */
  const fetchAllProposalEvents = async (): Promise<MirrorNodeDecodedProposalEvent[]> => {
    const tokenTransferEventsResults = fetchContractProposalEvents(
      ProposalType.TokenTransfer,
      Contracts.Governor.TransferToken.ProxyId
    );
    const createTokenEventsResults = fetchContractProposalEvents(
      ProposalType.CreateToken,
      Contracts.Governor.CreateToken.ProxyId
    );
    const textProposalEventsResults = fetchContractProposalEvents(
      ProposalType.Text,
      Contracts.Governor.TextProposal.ProxyId
    );
    const contractUpgradeEventsResults = fetchContractProposalEvents(
      ProposalType.ContractUpgrade,
      Contracts.Governor.ContractUpgrade.ProxyId
    );
    const proposalEventsResults = await Promise.allSettled([
      tokenTransferEventsResults,
      createTokenEventsResults,
      textProposalEventsResults,
      contractUpgradeEventsResults,
    ]);
    /*
     Currently, each proposal requires multiple additional calls to the smart contract
     to get all of the desired data for the UI. This is an expensive action that costs a large
     amount of hbar. We are only fetching data for the latest proposals for the time being to reduce
     the query overhead. A solution is being built on the smart contract to enable a single
     query to get all proposal data.
    */
    const proposalEvents = getFulfilledResultsData<MirrorNodeDecodedProposalEvent>(proposalEventsResults)
      .sort((a: MirrorNodeDecodedProposalEvent, b: MirrorNodeDecodedProposalEvent) => {
        const aTimestamp = a.timestamp ?? "";
        const bTimestamp = b.timestamp ?? "";
        return BigNumber(bTimestamp).comparedTo(aTimestamp);
      })
      .slice(0, 10);

    return proposalEvents;
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
    fetchAccountTokenBalances,
    fetchTokenBalances,
    fetchAccountBalances,
    fetchAllProposalEvents,
    fetchContractProposalEvents,
    fetchBlock,
    fetchContract,
    fetchTokenData,
  };
}

export { createMirrorNodeService };
export type { MirrorNodeServiceType };

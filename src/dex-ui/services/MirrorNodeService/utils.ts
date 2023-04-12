import Web3 from "web3";
import { MirrorNodeProposalEventLog } from "./types";

/**
 * Gathers all values from an array of fulfilled settled promise results.
 * @param promiseSettledResults - An array of settled promise results. Intended to come from
 * a Promise.allSettled call.
 * @returns An array of values from the fulfilled promises.
 */
export function getFulfilledResultsData<T>(promiseSettledResults: Array<PromiseSettledResult<T[]>>): T[] {
  return promiseSettledResults.reduce((values: T[], promiseSettledResult: PromiseSettledResult<T[]>): T[] => {
    if (promiseSettledResult.status === "fulfilled") return [...values, ...promiseSettledResult.value];
    return values;
  }, []);
}

const web3 = new Web3();

export function decodeLog(signatureMap: Map<string, any>, logs: MirrorNodeProposalEventLog[], eventName: string[]) {
  const eventsMap = new Map<string, any[]>();
  for (const log of logs) {
    try {
      const data = log.data;
      const topics = log.topics;
      const timeStamp = log.timestamp;
      const eventAbi = signatureMap.get(topics[0]);
      if (eventAbi !== undefined && eventName.includes(eventAbi.name)) {
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

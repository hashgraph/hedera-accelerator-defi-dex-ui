import { ethers } from "ethers";
import { Contracts } from "../constants";
import Factory from "../abi/Factory.json";
import { createContract } from "./utils";

/**
 * Creates an ethers.Contract representation of the Factory contract.
 * @param governorAccountId - The Factory contract account id.
 * @returns An ethers.Contract representation of the Factory contract
 */
function createFactoryContract(): ethers.Contract {
  return createContract(Contracts.Factory.ProxyId, Factory.abi);
}

/**
 * Fetches all pair contract addresses associated with the DEX.
 * @returns A list of all DEX pair contract addresses.
 */
async function fetchAllTokenPairs(): Promise<string[]> {
  const factoryContract = createFactoryContract();
  const pairContractAddresses: string[] = await factoryContract.getPairs();
  return pairContractAddresses;
}

/**
 * Fetches a pair contract address.
 * @returns A pair contract addresses.
 */
async function getPair(tokenAAddress: string, secondTokenAddress: string, transactionFee: number): Promise<string> {
  const factoryContract = createFactoryContract();
  return await factoryContract.getPair(tokenAAddress, secondTokenAddress, transactionFee);
}

const FactoryContract = { fetchAllTokenPairs, getPair };
export default FactoryContract;

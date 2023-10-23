import { ethers } from "ethers";
import { Contracts } from "../constants";
import Configuration from "../abi/Configuration.json";
import { createContract, convertEthersBigNumberToBigNumberJS } from "./utils";
import { BigNumber } from "bignumber.js";

/**
 * Creates an ethers.Contract representation of the Configuration contract.
 * @returns An ethers.Contract representation of the Configuration contract
 */
function createConfigurationContract(): ethers.Contract {
  return createContract(Contracts.Configuration.ProxyId, Configuration.abi);
}

/**
 * Fetches all Transaction Fee available for creating a pool.
 * @returns A list of all DEX pair contract addresses.
 */
async function getTransactionFees(): Promise<BigNumber[]> {
  const configurationContract = createConfigurationContract();
  const transactionFee = await configurationContract.getTransactionsFee();
  return transactionFee.map((fee: ethers.BigNumber) => convertEthersBigNumberToBigNumberJS(fee));
}

const ConfigurationContract = {
  getTransactionFees,
};
export default ConfigurationContract;

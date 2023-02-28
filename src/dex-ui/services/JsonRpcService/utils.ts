import { ContractId, TokenId } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { JsonRpcSigner } from "./JsonRpcService";

export const solidityAddressToTokenIdString = (address: string): string =>
  TokenId.fromSolidityAddress(address).toString();

/**
 * Checks if all addresses in the list are valid ethereum addresses.
 * @param addresses - Addresses to validate.
 */
export function checkIfTokenAddressesAreValid(addresses: string[]) {
  const areTokenAddressesValid = addresses.reduce(
    (areAddressesValid, address) => areAddressesValid && ethers.utils.isAddress(address),
    true
  );
  if (!areTokenAddressesValid) throw Error("Fetched pair token addresses are invalid.");
}

/**
 * Converts an ethers.BigNumber object into a BigNumber.js object.
 * @remarks
 * Large numbers returned from the JSON RPC endpoints are in an ethers.BigNumber
 * format. The DEX UI manages large numbers using the BigNumber.js library.
 * @param ethersBigNumber - The ethers.BigNumber representation of the number.
 * @returns The BigNumber.js representation of the number.
 */
export function convertEthersBigNumberToBigNumberJS(ethersBigNumber: ethers.BigNumber) {
  return BigNumber(ethersBigNumber.toString());
}

/**
 * Creates an ethers.Contract object with a given signer.
 * @param contractId - Account id of the contract.
 * @param abi - ABI for the contract.
 * @returns An ethers.Contract representation of the provided contract data.
 */
export function createContract(contractId: string, abi: any[]): ethers.Contract {
  const solidityAddress = ContractId.fromString(contractId).toSolidityAddress();
  return new ethers.Contract(solidityAddress, abi, JsonRpcSigner);
}

/**
 * Creates an ethers.Contract object with a given signer.
 * @param address - Solidity address of the contract.
 * @param abi - ABI for the contract.
 * @returns An ethers.Contract representation of the provided contract data.
 */
export function createContractWithSolidityAddress(address: string, abi: any[]): ethers.Contract {
  return new ethers.Contract(address, abi, JsonRpcSigner);
}

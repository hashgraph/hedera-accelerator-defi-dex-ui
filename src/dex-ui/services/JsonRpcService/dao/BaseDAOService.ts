import { ethers } from "ethers";
import { createContractWithSolidityAddress } from "../utils";
import BaseDAOContract from "../../abi/BaseDAO.json";

interface Social {
  key: string;
  value: string;
}

export interface BaseDAO {
  address: string;
  name: string;
  logoUrl: string;
  webLinks: Social[];
}

/**
 * Creates an ethers.Contract representation of the Base DAO contract.
 * @param daoAddress - The Base DAO contract solidity address.
 * @returns An ethers.Contract representation of the Base DAO contract
 */
function createBaseDAOContract(daoAddress: string): ethers.Contract {
  return createContractWithSolidityAddress(daoAddress, BaseDAOContract.abi);
}

/** TODO: Replace with Mirror Node Event Fetching */
export async function fetchDAODetails(baseDaoAddress: string): Promise<BaseDAO> {
  const baseDAOContract = createBaseDAOContract(baseDaoAddress);
  const dao: Promise<BaseDAO> = baseDAOContract.getDaoDetail();
  return dao;
}

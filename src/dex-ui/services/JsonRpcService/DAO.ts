import { ethers } from "ethers";
import { createContract, createContractWithSolidityAddress } from "./utils";
import GovernanceDAOFactory from "../abi/GovernanceDAOFactory.json";
import BaseDAO from "../abi/BaseDAO.json";
import { Contracts } from "../";

interface Social {
  key: string;
  value: string;
}

interface DAO {
  name: string;
  logoUrl: string;
  webLinks: Social[];
}

/**
 * Creates an ethers.Contract representation of the Governance DAO Factory contract.
 * @returns An ethers.Contract representation of the Governance DAO Factory contract
 */
function createGovernanceDAOFactoryContract(): ethers.Contract {
  return createContract(Contracts.GovernanceDAOFactory.ProxyId, GovernanceDAOFactory.abi);
}

/**
 * Creates an ethers.Contract representation of the Base DAO contract.
 * @param daoAddress - The Base DAO contract solidity address.
 * @returns An ethers.Contract representation of the Base DAO contract
 */
function createBaseDAOContract(daoAddress: string): ethers.Contract {
  return createContractWithSolidityAddress(daoAddress, BaseDAO.abi);
}

async function fetchAllDAOs(): Promise<DAO[]> {
  const daosAddresses: string[] = await fetchAllDAOAddresses();
  return Promise.all(daosAddresses.map((daoAddress: string) => fetchDAODetails(daoAddress)));
}

async function fetchAllDAOAddresses(): Promise<string[]> {
  const governanceDAOFactoryContract = createGovernanceDAOFactoryContract();
  const daoAddresses: Promise<string[]> = governanceDAOFactoryContract.getDAOs();
  return daoAddresses;
}

async function fetchDAODetails(baseDaoAddress: string): Promise<DAO> {
  const baseDAOContract = createBaseDAOContract(baseDaoAddress);
  const dao: Promise<DAO> = baseDAOContract.getDaoDetail();
  return dao;
}

const DAOContract = { fetchAllDAOs };
export default DAOContract;

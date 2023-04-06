import { ethers } from "ethers";
import { createContract } from "../utils";
import GovernanceDAOFactory from "../../abi/GovernanceDAOFactory.json";
import { Contracts } from "../..";
import { BaseDAO, fetchDAODetails } from "./BaseDAOService";
import { DAOType } from "../../../pages";

interface GovernanceDAO extends BaseDAO {
  type: DAOType.GovernanceToken;
  address: string;
}

/**
 * Creates an ethers.Contract representation of the Governance DAO Factory contract.
 * @returns An ethers.Contract representation of the Governance DAO Factory contract
 */
function createGovernanceDAOFactoryContract(): ethers.Contract {
  return createContract(Contracts.GovernanceDAOFactory.ProxyId, GovernanceDAOFactory.abi);
}

/** TODO: Replace with Mirror Node Event Fetching */
export async function fetchAllGovernanceDAODetails(): Promise<GovernanceDAO[]> {
  const daosAddresses: string[] = await fetchAllGovernanceDAOAddresses();
  return Promise.all(
    daosAddresses.map((daoAddress: string) =>
      fetchDAODetails(daoAddress).then(
        (data): GovernanceDAO => ({ ...data, address: daoAddress, type: DAOType.GovernanceToken })
      )
    )
  );
}

/** TODO: Replace with Mirror Node Event Fetching */
async function fetchAllGovernanceDAOAddresses(): Promise<string[]> {
  const governanceDAOFactoryContract = createGovernanceDAOFactoryContract();
  const governanceDaoAddresses: Promise<string[]> = governanceDAOFactoryContract.getDAOs();
  return governanceDaoAddresses;
}

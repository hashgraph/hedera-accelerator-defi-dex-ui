import { ethers } from "ethers";
import { createContract } from "../utils";
import MultiSigDAOFactory from "../../abi/MultiSigDAOFactory.json";
import { Contracts } from "../..";
import { BaseDAO, fetchDAODetails } from "./BaseDAOService";
import { DAOType } from "../../../pages";

interface MultiSigDAO extends BaseDAO {
  type: DAOType.MultiSig;
  address: string;
}

/**
 * Creates an ethers.Contract representation of the MultiSig DAO Factory contract.
 * @returns An ethers.Contract representation of the MultiSig DAO Factory contract
 */
function createMultiSigDAOFactoryContract(): ethers.Contract {
  return createContract(Contracts.MultiSigDAOFactory.ProxyId, MultiSigDAOFactory.abi);
}

/** TODO: Replace with Mirror Node Event Fetching */
export async function fetchAllMultiSigDAODetails(): Promise<MultiSigDAO[]> {
  const multiSigDaoAddresses: string[] = await fetchAllMultiSigDAOAddresses();
  return Promise.all(
    multiSigDaoAddresses.map((daoAddress: string) =>
      fetchDAODetails(daoAddress).then(
        (data): MultiSigDAO => ({ ...data, address: daoAddress, type: DAOType.MultiSig })
      )
    )
  );
}

/** TODO: Replace with Mirror Node Event Fetching */
async function fetchAllMultiSigDAOAddresses(): Promise<string[]> {
  const multiSigDAOFactoryContract = createMultiSigDAOFactoryContract();
  const multiSigDaoAddresses: Promise<string[]> = multiSigDAOFactoryContract.getDAOs();
  return multiSigDaoAddresses;
}

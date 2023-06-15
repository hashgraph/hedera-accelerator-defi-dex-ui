import { ethers } from "ethers";
import GodHolder from "../abi/GODHolder.json";
import { convertEthersBigNumberToBigNumberJS, createContract } from "./utils";
import BigNumber from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";

/**
 * Creates an ethers.Contract representation of the GODHolder contract.
 * @returns An ethers.Contract representation of the GODHolder contract
 */
function createGODHolderContract(tokenHolderAddress: string): ethers.Contract {
  return createContract(tokenHolderAddress, GodHolder.abi);
}

/**
 * Fetched Locked GOV Tokens Quantity for the user.
 * @returns Locked GOV tokens quantity
 */
async function fetchLockedGODTokens(accountId: string, tokenHolderAddress: string): Promise<BigNumber | undefined> {
  const godHolderContract = createGODHolderContract(tokenHolderAddress);
  const accountAddress = AccountId.fromString(accountId).toSolidityAddress();
  const lockedGOVToken: ethers.BigNumber = await godHolderContract.balanceOfVoter(accountAddress);
  return convertEthersBigNumberToBigNumberJS(lockedGOVToken);
}

/**
 * @returns Boolean whether user can unlock GOD Token
 */
async function fetchCanUserUnlockGODToken(tokenHolderAddress: string): Promise<boolean> {
  const godHolderContract = createGODHolderContract(tokenHolderAddress);
  const canUserUnlockGODToken: boolean = await godHolderContract.canUserClaimTokens();
  return canUserUnlockGODToken;
}

const GODHolderContract = {
  fetchLockedGODTokens,
  fetchCanUserUnlockGODToken,
};

export default GODHolderContract;

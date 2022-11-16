import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/provider/signer";
import { ContractId } from "@hashgraph/sdk";

enum GovernorContractFunctions {
  CreateProposal = "propose",
  GetState = "state",
  GetProposalVotes = "proposalVotes",
}

interface AddLiquidityDetails {
  firstTokenAddress: string;
  firstTokenQuantity: BigNumber;
  secondTokenAddress: string;
  secondTokenQuantity: BigNumber;
  addLiquidityContractAddress: ContractId;
  walletAddress: string;
  signer: HashConnectSigner;
}

export { GovernorContractFunctions };
export type { AddLiquidityDetails };

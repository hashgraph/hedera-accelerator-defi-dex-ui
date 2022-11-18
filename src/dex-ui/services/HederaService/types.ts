import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/provider/signer";
import { ContractId } from "@hashgraph/sdk";

enum GovernorContractFunctions {
  CreateProposal = "propose",
  GetState = "state",
  GetProposalVotes = "proposalVotes",
}

enum PairContractFunctions {
  GetLiquidityProviderTokenAmounts = "getContributorTokenShare",
  GetSpotPrice = "getSpotPrice",
  GetFee = "getFee",
  GetFeePrecision = "getFeePrecision",
  GetPrecision = "getPrecisionValue",
  GetPoolBalances = "getPairQty",
  GetContractAddress = "getContractAddress",
  GetTokenAddresses = "getTokenPairAddress",
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

export { GovernorContractFunctions, PairContractFunctions };
export type { AddLiquidityDetails };

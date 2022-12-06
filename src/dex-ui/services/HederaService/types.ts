import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { ContractId } from "@hashgraph/sdk";

enum GovernorContractFunctions {
  CreateProposal = "propose",
  GetState = "state",
  GetProposalVotes = "proposalVotes",
  GetQuorum = "quorum",
  CastVote = "castVote",
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
  GetTokenPair = "getPairs",
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

interface NewTokenPair {
  tokenA: TokenPairs;
  tokenB: TokenPairs;
  pairToken: {
    symbol: string | undefined
    accountId: string | undefined
  }
}
interface TokenPairs {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairContractId: string | undefined;
    tokenId: string | undefined;
  };
}

export { GovernorContractFunctions, PairContractFunctions };
export type { AddLiquidityDetails, TokenPairs, NewTokenPair };

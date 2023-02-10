import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { ContractId } from "@hashgraph/sdk";

enum GovernorContractFunctions {
  CreateProposal = "createProposal",
  CastVote = "castVote",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  DeployABIFile = "deployABIFile",
  CancelProposal = "cancelProposal",
}

enum PairContractFunctions {
  SwapToken = "swapToken",
  CreatePair = "createPair",
}

interface AddLiquidityDetails {
  firstTokenAddress: string;
  firstTokenQuantity: BigNumber;
  secondTokenAddress: string;
  secondTokenQuantity: BigNumber;
  addLiquidityContractAddress: ContractId;
  HbarAmount: BigNumber | number;
  walletAddress: string;
  signer: HashConnectSigner;
}

interface CreatePoolDetails {
  firstTokenAddress: string;
  secondTokenAddress: string;
  transactionFee: BigNumber;
  walletAddress: string;
  signer: HashConnectSigner;
}

interface TokenPair {
  tokenA: Token;
  tokenB: Token;
  pairToken: {
    symbol: string | undefined;
    pairLpAccountId: string | undefined;
    totalSupply?: Long | null;
    decimals: number;
  };
}
interface Token {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairAccountId: string | undefined;
    tokenId: string | undefined;
  };
}

export { GovernorContractFunctions, PairContractFunctions };
export type { AddLiquidityDetails, CreatePoolDetails, TokenPair, Token };

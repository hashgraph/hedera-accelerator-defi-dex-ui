import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/provider/signer";
import { ContractId } from "@hashgraph/sdk";

interface AddLiquidityDetails {
  firstTokenAddress: string;
  firstTokenQuantity: BigNumber;
  secondTokenAddress: string;
  secondTokenQuantity: BigNumber;
  addLiquidityContractAddress: ContractId;
  walletAddress: string;
  signer: HashConnectSigner;
}

interface CreateProposalParams {
  targets: Array<string>;
  fees: Array<number>;
  calls: Array<Uint8Array>;
  description: string;
}

export type { AddLiquidityDetails, CreateProposalParams };

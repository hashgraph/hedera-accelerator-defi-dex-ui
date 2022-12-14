import { BigNumber } from "bignumber.js";
import { AccountId, ContractExecuteTransaction, ContractFunctionParameters, TransactionResponse } from "@hashgraph/sdk";
import { ContractId } from "@hashgraph/sdk";
import { GovernorProxyContracts, TREASURY_ID } from "../constants";
import { GovernorContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

interface CastVoteParams {
  contractId: string;
  proposalId: BigNumber;
  voteType: number;
  signer: HashConnectSigner;
}

const castVote = async ({ contractId, proposalId, voteType, signer }: CastVoteParams) => {
  const governorContractId = ContractId.fromString(contractId);
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(proposalId).addUint8(voteType);
  const castVoteTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.CastVote, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);

  const response = await castVoteTransaction.executeWithSigner(signer);
  return response;
};

interface CreateTransferTokenProposalParams {
  description: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: BigNumber;
  signer: HashConnectSigner;
}

const sendCreateTransferTokenProposalTransaction = async ({
  description,
  accountToTransferTo,
  tokenToTransfer,
  amountToTransfer,
  signer,
}: CreateTransferTokenProposalParams): Promise<TransactionResponse> => {
  const accountToTransferFrom = TREASURY_ID;
  const transferFromAddress = AccountId.fromString(accountToTransferFrom).toSolidityAddress();
  const transferToAddress = AccountId.fromString(accountToTransferTo).toSolidityAddress();
  const tokenToTransferAddress = AccountId.fromString(tokenToTransfer).toSolidityAddress();

  const contractCallParams = new ContractFunctionParameters()
    .addString(description)
    .addAddress(transferFromAddress)
    .addAddress(transferToAddress)
    .addAddress(tokenToTransferAddress)
    .addInt256(amountToTransfer);

  const createProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(GovernorProxyContracts.TransferTokenContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);

  const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
  return proposalTransactionResponse;
};

const GovernorService = { castVote, sendCreateTransferTokenProposalTransaction };
export default GovernorService;

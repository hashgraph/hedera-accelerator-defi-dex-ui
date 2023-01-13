import { BigNumber } from "bignumber.js";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransferTransaction,
  TokenAssociateTransaction,
  TransactionResponse,
  Hbar,
} from "@hashgraph/sdk";
import { GovernorProxyContracts, Tokens, TOKEN_SYMBOL_TO_ACCOUNT_ID, FACTORY_CONTRACT_ID } from "../constants";
import { AddLiquidityDetails, GovernorContractFunctions, PairContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { client, queryContract, getTreasurer, getAddressArray } from "./utils";
import GovernorService from "./GovernorService";

type HederaServiceType = ReturnType<typeof createHederaService>;

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */

function createHederaService() {
  const { treasuryId, treasuryKey } = getTreasurer();
  const factoryContractId = ContractId.fromString(FACTORY_CONTRACT_ID); //
  let _precision = BigNumber(100000000);
  const initHederaService = async () => {
    // Since the Precision if fixed from Backend keeping it constant for a while.
    _precision = BigNumber(100000000);
  };

  const fetchTokenPairs = async (): Promise<string[] | null> => {
    const result = await queryContract(factoryContractId, PairContractFunctions.GetTokenPair);
    const pairEvmAddressess = getAddressArray(result);
    return pairEvmAddressess;
  };

  const getPrecision = () => {
    return _precision;
  };

  const fetchPrecision = async (contractId: ContractId): Promise<BigNumber | undefined> => {
    const result = await queryContract(contractId, PairContractFunctions.GetPrecision);
    const precision = result?.getInt256(0);
    return precision;
  };

  const withPrecision = (value: number): BigNumber => {
    if (_precision === undefined) {
      throw new Error("Precision is undefined");
    }
    return BigNumber(value).multipliedBy(_precision);
  };

  const addLiquidity = async (addLiquidityDetails: AddLiquidityDetails) => {
    const {
      firstTokenAddress,
      firstTokenQuantity,
      secondTokenAddress,
      secondTokenQuantity,
      addLiquidityContractAddress,
      walletAddress,
      HbarAmount,
      signer,
    } = addLiquidityDetails;

    const addLiquidityTransaction = await new ContractExecuteTransaction()
      .setContractId(addLiquidityContractAddress)
      .setGas(9000000)
      .setFunction(
        "addLiquidity",
        new ContractFunctionParameters()
          .addAddress(walletAddress)
          .addAddress(firstTokenAddress)
          .addAddress(secondTokenAddress)
          .addInt256(firstTokenQuantity)
          .addInt256(secondTokenQuantity)
      )
      .setNodeAccountIds([new AccountId(3)])
      .setPayableAmount(new Hbar(HbarAmount))
      .freezeWithSigner(signer);
    await addLiquidityTransaction.executeWithSigner(signer);
  };

  const removeLiquidity = async (signer: HashConnectSigner, lpTokenAmount: BigNumber, contractId: ContractId) => {
    const accountId = signer.getAccountId().toSolidityAddress();
    const removeLiquidity = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(5000000)
      .setFunction("removeLiquidity", new ContractFunctionParameters().addAddress(accountId).addInt256(lpTokenAmount))
      .freezeWithSigner(signer);

    const removeLiquidityTx = await removeLiquidity.executeWithSigner(signer);
    return removeLiquidityTx;
  };

  interface SwapTokenParams {
    contractId: ContractId;
    walletAddress: string;
    tokenToTradeAddress: string;
    tokenToTradeAmount: BigNumber;
    HbarAmount: number;
    signer: HashConnectSigner;
  }

  const swapToken = async ({
    contractId,
    walletAddress,
    tokenToTradeAddress,
    tokenToTradeAmount,
    HbarAmount,
    signer,
  }: SwapTokenParams): Promise<TransactionResponse> => {
    const contractFunctionParams = new ContractFunctionParameters()
      .addAddress(walletAddress)
      .addAddress(tokenToTradeAddress)
      .addInt256(tokenToTradeAmount);
    const swapTokenTransaction = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction(PairContractFunctions.SwapToken, contractFunctionParams)
      .setGas(9000000)
      .setNodeAccountIds([new AccountId(3)])
      .setPayableAmount(new Hbar(HbarAmount))
      .freezeWithSigner(signer);
    const swapTokenResponse = await swapTokenTransaction.executeWithSigner(signer);
    return swapTokenResponse;
  };

  interface CreateProposalParams {
    targets: Array<string>;
    fees: Array<number>;
    calls: Array<Uint8Array>;
    description: string;
    signer: HashConnectSigner;
  }

  const createProposal = async ({
    targets,
    fees,
    calls,
    description,
    signer,
  }: CreateProposalParams): Promise<TransactionResponse> => {
    const contractCallParams = new ContractFunctionParameters()
      .addAddressArray(targets)
      .addUint256Array(fees)
      .addBytesArray(calls)
      .addString(description);
    const createProposalTransaction = await new ContractExecuteTransaction()
      .setContractId(GovernorProxyContracts.TransferTokenContractId)
      .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
      .setGas(900000)
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);
    const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
    return proposalTransactionResponse;
  };

  const get10L49ABCDTokens = async (
    receivingAccountId: string,
    associatedTokenIds: string[] | undefined,
    signer: HashConnectSigner
  ) => {
    const tokenQuantity = withPrecision(10).toNumber();
    const L49ATokenId = TokenId.fromString(Tokens.TokenAAccountId);
    const L49BTokenId = TokenId.fromString(Tokens.TokenBAccountId);
    const L49CTokenId = TokenId.fromString(Tokens.TokenCAccountId);
    const L49DTokenId = TokenId.fromString(Tokens.TokenDAccountId);
    const targetAccountId = AccountId.fromString(receivingAccountId);

    const tokensToAssociate = [
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(Tokens.TokenASymbol),
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(Tokens.TokenBSymbol),
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(Tokens.TokenCSymbol),
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(Tokens.TokenDSymbol),
    ].reduce((_tokensToAssociate: string[], tokenId: string | undefined) => {
      if (associatedTokenIds && !associatedTokenIds.includes(tokenId ?? "")) {
        _tokensToAssociate.push(tokenId || "");
      }
      return _tokensToAssociate;
    }, []);

    if (tokensToAssociate.length > 0) {
      const tokenAssociateTx = new TokenAssociateTransaction()
        .setAccountId(receivingAccountId)
        .setTokenIds(tokensToAssociate);
      const tokenAssociateSignedTx = await tokenAssociateTx.freezeWithSigner(signer);
      await tokenAssociateSignedTx.executeWithSigner(signer);
    }

    const transaction = new TransferTransaction()
      .addTokenTransfer(L49ATokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49ATokenId, targetAccountId, tokenQuantity)
      .addTokenTransfer(L49BTokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49BTokenId, targetAccountId, tokenQuantity)
      .addTokenTransfer(L49CTokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49CTokenId, targetAccountId, tokenQuantity)
      .addTokenTransfer(L49DTokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49DTokenId, targetAccountId, tokenQuantity)
      .freezeWith(client);

    const signTx = await transaction.sign(treasuryKey);
    const txResponse = await signTx.execute(client);
    return txResponse;
  };

  // TODO: will need to pass in contractId in future when there are more pools
  const pairCurrentPosition = async (contractId: ContractId) => {
    const result = await queryContract(contractId, PairContractFunctions.GetPoolBalances);
    const tokenAQty = result?.getInt256(0);
    const tokenBQty = result?.getInt256(1);
    return { tokenAQty, tokenBQty };
  };

  const getContributorTokenShare = async (
    contractId: ContractId
  ): Promise<{
    tokenAQty: BigNumber;
    tokenBQty: BigNumber;
  }> => {
    const queryParams = new ContractFunctionParameters().addAddress(treasuryId.toSolidityAddress());
    const result = await queryContract(contractId, PairContractFunctions.GetLiquidityProviderTokenAmounts, queryParams);
    const tokenAQty = result?.getInt64(0);
    const tokenBQty = result?.getInt64(1);
    return { tokenAQty, tokenBQty };
  };

  const getSpotPrice = async (pairAccountId: string): Promise<BigNumber> => {
    const pairContractId = ContractId.fromString(pairAccountId);
    const result = await queryContract(pairContractId, PairContractFunctions.GetSpotPrice);
    const spotPrice = result?.getInt256(0);
    return spotPrice;
  };

  const fetchFeeWithPrecision = async (pairAccountId: string): Promise<BigNumber | undefined> => {
    const fee = await fetchFee(pairAccountId);
    const feePrecision = await fetchFeePrecision(pairAccountId);
    if (feePrecision === undefined) {
      throw new Error("fee precision is undefined");
    }
    return fee?.div(feePrecision.times(10));
  };

  const fetchFee = async (pairAccountId: string): Promise<BigNumber | undefined> => {
    const pairContractId = ContractId.fromString(pairAccountId);
    const result = await queryContract(pairContractId, PairContractFunctions.GetFee);
    const fee = result?.getInt256(0);
    const feePrecision = await fetchFeePrecision(pairAccountId);
    return fee?.div(feePrecision?.toNumber() ?? 1);
  };

  const fetchFeePrecision = async (pairAccountId: string): Promise<BigNumber | undefined> => {
    const pairContractId = ContractId.fromString(pairAccountId);
    const result = await queryContract(pairContractId, PairContractFunctions.GetFeePrecision);
    const feePrecision = result?.getInt256(0);
    return feePrecision;
  };

  const getTokenBalances = async (
    contractId: ContractId
  ): Promise<{
    amountOfTokenA: BigNumber | undefined;
    amountOfTokenB: BigNumber | undefined;
  }> => {
    const result = await queryContract(contractId, PairContractFunctions.GetPoolBalances);
    const amountOfTokenA = result?.getInt256(0);
    const amountOfTokenB = result?.getInt256(1);
    return { amountOfTokenA, amountOfTokenB };
  };

  const getContractAddress = async (contractId: ContractId): Promise<string> => {
    const result = await queryContract(contractId, PairContractFunctions.GetContractAddress);
    const contractAddress = AccountId.fromSolidityAddress(result?.getAddress(0) ?? "").toString();
    return contractAddress;
  };

  const getTokenPairAddress = async (
    contractId: ContractId
  ): Promise<{
    tokenAAddress: string;
    tokenBAddress: string;
    tokenCAddress: string;
  }> => {
    const result = await queryContract(contractId, PairContractFunctions.GetTokenAddresses);
    const tokenAAddress = AccountId.fromSolidityAddress(result?.getAddress(0) ?? "").toString();
    const tokenBAddress = AccountId.fromSolidityAddress(result?.getAddress(1) ?? "").toString();
    const tokenCAddress = AccountId.fromSolidityAddress(result?.getAddress(2) ?? "").toString();
    return { tokenAAddress, tokenBAddress, tokenCAddress };
  };

  return {
    initHederaService,
    get10L49ABCDTokens,
    getPrecision,
    swapToken,
    addLiquidity,
    removeLiquidity,
    createProposal,
    getContributorTokenShare,
    getTokenBalances,
    getSpotPrice,
    fetchFeeWithPrecision,
    fetchFee,
    fetchFeePrecision,
    pairCurrentPosition,
    getContractAddress,
    getTokenPairAddress,
    fetchTokenPairs,
    fetchPrecision,
    ...GovernorService,
  };
}

export { createHederaService };
export type { HederaServiceType };

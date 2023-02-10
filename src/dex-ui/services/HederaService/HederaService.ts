import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
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
import { Contracts, Tokens, TOKEN_SYMBOL_TO_ACCOUNT_ID, TREASURY_ID } from "../constants";
import { AddLiquidityDetails, CreatePoolDetails, PairContractFunctions } from "./types";
import { client, getTreasurer } from "./utils";
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

  let _precision = BigNumber(100000000);
  const initHederaService = async () => {
    // Since the Precision if fixed from Backend keeping it constant for a while.
    _precision = BigNumber(100000000);
  };

  const getPrecision = () => {
    return _precision;
  };

  const withPrecision = (value: number): BigNumber => {
    if (_precision === undefined) {
      throw new Error("Precision is undefined");
    }
    return BigNumber(value).multipliedBy(_precision);
  };

  const addLiquidity = async (addLiquidityDetails: AddLiquidityDetails): Promise<TransactionResponse> => {
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
    const transactionResponse = addLiquidityTransaction.executeWithSigner(signer);
    return transactionResponse;
  };

  const createPool = async (createPoolDetails: CreatePoolDetails): Promise<TransactionResponse> => {
    const { firstTokenAddress, secondTokenAddress, transactionFee, signer } = createPoolDetails;

    const factoryContractId = ContractId.fromString(Contracts.Factory.ProxyId);
    const createPoolTransaction = await new ContractExecuteTransaction()
      .setContractId(factoryContractId)
      .setGas(9000000)
      .setFunction(
        PairContractFunctions.CreatePair,
        new ContractFunctionParameters()
          .addAddress(firstTokenAddress)
          .addAddress(secondTokenAddress)
          .addAddress(ContractId.fromString(TREASURY_ID).toSolidityAddress())
          .addInt256(transactionFee)
      )
      .setMaxTransactionFee(new Hbar(100))
      .setPayableAmount(new Hbar(100))
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);
    const transactionResponse = createPoolTransaction.executeWithSigner(signer);
    return transactionResponse;
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

  const get1000L49ABCDTokens = async (
    receivingAccountId: string,
    associatedTokenIds: string[] | undefined,
    signer: HashConnectSigner
  ) => {
    const tokenQuantity = withPrecision(1000).toNumber();
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

  return {
    initHederaService,
    get1000L49ABCDTokens,
    getPrecision,
    swapToken,
    addLiquidity,
    removeLiquidity,
    createPool,
    ...GovernorService,
  };
}

export { createHederaService };
export type { HederaServiceType };

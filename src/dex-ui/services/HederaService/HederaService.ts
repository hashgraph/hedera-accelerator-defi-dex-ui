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
import { PairContractFunctions } from "./types";
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

  interface AddLiquidityParams {
    firstTokenAddress: string;
    firstTokenQuantity: BigNumber;
    secondTokenAddress: string;
    secondTokenQuantity: BigNumber;
    addLiquidityContractAddress: ContractId;
    HbarAmount: BigNumber | number;
    /** Duration the transaction is valid for in seconds. Default is 120 seconds. */
    transactionDeadline: number;
    walletAddress: string;
    signer: HashConnectSigner;
  }

  async function addLiquidity(params: AddLiquidityParams): Promise<TransactionResponse> {
    const addLiquidityTransaction = await new ContractExecuteTransaction()
      .setContractId(params.addLiquidityContractAddress)
      .setGas(9000000)
      .setFunction(
        "addLiquidity",
        new ContractFunctionParameters()
          .addAddress(params.walletAddress)
          .addAddress(params.firstTokenAddress)
          .addAddress(params.secondTokenAddress)
          .addInt256(params.firstTokenQuantity)
          .addInt256(params.secondTokenQuantity)
      )
      .setPayableAmount(new Hbar(params.HbarAmount))
      .setTransactionValidDuration(params.transactionDeadline)
      .freezeWithSigner(params.signer);
    const transactionResponse = addLiquidityTransaction.executeWithSigner(params.signer);
    return transactionResponse;
  }

  interface RemoveLiquidityParams {
    /** Duration the transaction is valid for in seconds. Default is 120 seconds. */
    transactionDeadline: number;
    lpTokenAmount: BigNumber;
    signer: HashConnectSigner;
    contractId: ContractId;
  }

  const removeLiquidity = async (params: RemoveLiquidityParams): Promise<TransactionResponse> => {
    const accountId = params.signer.getAccountId().toSolidityAddress();
    const contractFunctionParams = new ContractFunctionParameters()
      .addAddress(accountId)
      .addInt256(params.lpTokenAmount);
    const removeLiquidity = await new ContractExecuteTransaction()
      .setContractId(params.contractId)
      .setGas(5000000)
      .setFunction(PairContractFunctions.RemoveLiquidity, contractFunctionParams)
      .setTransactionValidDuration(params.transactionDeadline)
      .freezeWithSigner(params.signer);

    const removeLiquidityTx = await removeLiquidity.executeWithSigner(params.signer);
    return removeLiquidityTx;
  };

  interface SwapTokenParams {
    contractId: ContractId;
    walletAddress: string;
    tokenToTradeAddress: string;
    tokenToTradeAmount: BigNumber;
    slippageTolerance: BigNumber;
    /** Duration the transaction is valid for in seconds. Default is 120 seconds. */
    transactionDeadline: number;
    HbarAmount: number;
    signer: HashConnectSigner;
  }

  async function swapToken(params: SwapTokenParams): Promise<TransactionResponse> {
    const contractFunctionParams = new ContractFunctionParameters()
      .addAddress(params.walletAddress)
      .addAddress(params.tokenToTradeAddress)
      .addInt256(params.tokenToTradeAmount)
      .addInt256(params.slippageTolerance);
    const swapTokenTransaction = await new ContractExecuteTransaction()
      .setContractId(params.contractId)
      .setFunction(PairContractFunctions.SwapToken, contractFunctionParams)
      .setGas(9000000)
      .setPayableAmount(new Hbar(params.HbarAmount))
      .setTransactionValidDuration(params.transactionDeadline)
      .freezeWithSigner(params.signer);
    const swapTokenResponse = await swapTokenTransaction.executeWithSigner(params.signer);
    return swapTokenResponse;
  }

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

  interface CreatePoolDetails {
    firstTokenAddress: string;
    secondTokenAddress: string;
    transactionFee: BigNumber;
    transactionDeadline: number;
    walletAddress: string;
    signer: HashConnectSigner;
  }

  const createPool = async (createPoolDetails: CreatePoolDetails): Promise<TransactionResponse> => {
    const factoryContractId = ContractId.fromString(Contracts.Factory.ProxyId);
    const { firstTokenAddress, secondTokenAddress, transactionFee, transactionDeadline, signer } = createPoolDetails;
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
      .setTransactionValidDuration(transactionDeadline)
      .freezeWithSigner(signer);
    const transactionResponse = createPoolTransaction.executeWithSigner(signer);
    return transactionResponse;
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

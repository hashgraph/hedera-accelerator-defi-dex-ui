import {
  AccountId,
  TokenCreateTransaction,
  AccountAllowanceApproveTransaction,
  TokenType,
  TokenSupplyType,
  PublicKey,
  TokenAssociateTransaction,
  TokenId,
  NftId,
  Hbar,
} from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { checkTransactionResponseForError } from "./utils";
import { BigNumber } from "bignumber.js";

export enum TokenServiceFunctions {
  CreateToken = "createToken",
  SetTokenAllowance = "setTokenAllowance",
  AssociateToken = "associateToken",
  SetNFTAllowance = "setNFTAllowance",
}

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */
interface CreateTokenParams {
  name: string;
  symbol: string;
  initialSupply: number;
  supplyKey: string;
  decimals: number;
  tokenWalletAddress: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
async function createToken(params: CreateTokenParams) {
  const { name, symbol, initialSupply, decimals = 0, tokenWalletAddress, supplyKey } = params;
  const treasury = AccountId.fromString(tokenWalletAddress);
  const key = PublicKey.fromString(supplyKey);
  const preciseInitialSupply = BigNumber(initialSupply).shiftedBy(Number(decimals)).toNumber();
  const createTokenTransaction = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setInitialSupply(preciseInitialSupply)
    .setDecimals(decimals)
    .setTreasuryAccountId(treasury)
    .setAutoRenewAccountId(treasury)
    .setAutoRenewPeriod(7000000)
    .setAdminKey(key)
    .setWipeKey(key)
    .setFreezeKey(key)
    .setPauseKey(key)
    .setSupplyKey(key)
    .freezeWithSigner(params.signer);
  const response = await createTokenTransaction.executeWithSigner(params.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.CreateToken);
  return response;
}

interface SetTokenAllowanceParams {
  tokenId: string;
  spenderContractId: string;
  tokenAmount: number;
  walletId: string;
  signer: HashConnectSigner;
}

interface SetHbarAllowanceParams {
  spenderContractId: string;
  tokenAmount: number;
  walletId: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
async function setTokenAllowance(params: SetTokenAllowanceParams) {
  const tokenAllowanceTxn = new AccountAllowanceApproveTransaction().approveTokenAllowance(
    params.tokenId,
    params.walletId,
    params.spenderContractId,
    params.tokenAmount
  );
  const tokenAllowanceSignedTx = await tokenAllowanceTxn.freezeWithSigner(params.signer);
  const response = await tokenAllowanceSignedTx.executeWithSigner(params.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.SetTokenAllowance);
}

/**
 * TODO: Change the approach to make multiple params as array[]
 * @param params -
 * @returns
 */
async function setTokenAllowanceForAddLiquidity(tokenA: SetTokenAllowanceParams, tokenB: SetTokenAllowanceParams) {
  const tokenAllowanceTxn = new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(tokenA.tokenId, tokenA.walletId, tokenA.spenderContractId, tokenA.tokenAmount)
    .approveTokenAllowance(tokenB.tokenId, tokenB.walletId, tokenB.spenderContractId, tokenB.tokenAmount);
  const tokenAllowanceSignedTx = await tokenAllowanceTxn.freezeWithSigner(tokenA.signer);
  const response = await tokenAllowanceSignedTx.executeWithSigner(tokenA.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.SetTokenAllowance);
}

/**
 * TODO
 * @param params -
 * @returns
 */
async function setHbarTokenAllowance(params: SetHbarAllowanceParams) {
  const tokenAllowanceTxn = new AccountAllowanceApproveTransaction().approveHbarAllowance(
    params.walletId,
    params.spenderContractId,
    Hbar.fromTinybars(params.tokenAmount)
  );
  const tokenAllowanceSignedTx = await tokenAllowanceTxn.freezeWithSigner(params.signer);
  const response = await tokenAllowanceSignedTx.executeWithSigner(params.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.SetTokenAllowance);
}

/**
 * TODO: Change the approach to make multiple params as array[]
 * @param params -
 * @returns
 */
async function setHbarTokenAllowanceForAddLiquidity(
  hbarTokenData: SetHbarAllowanceParams,
  tokenB: SetTokenAllowanceParams
) {
  const tokenAllowanceTxn = new AccountAllowanceApproveTransaction()
    .approveHbarAllowance(hbarTokenData.walletId, hbarTokenData.spenderContractId, hbarTokenData.tokenAmount)
    .approveTokenAllowance(tokenB.tokenId, tokenB.walletId, tokenB.spenderContractId, tokenB.tokenAmount);
  const tokenAllowanceSignedTx = await tokenAllowanceTxn.freezeWithSigner(hbarTokenData.signer);
  const response = await tokenAllowanceSignedTx.executeWithSigner(hbarTokenData.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.SetTokenAllowance);
}

interface CreateNFTParams {
  name: string;
  symbol: string;
  maxSupply: number;
  supplyKey: string;
  tokenWalletAddress: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
async function createNFT(params: CreateNFTParams) {
  const treasury = AccountId.fromString(params.tokenWalletAddress);
  const key = PublicKey.fromString(params.supplyKey);
  const createNFTTransaction = await new TokenCreateTransaction()
    .setTokenName(params.name)
    .setTokenSymbol(params.symbol)
    .setAdminKey(key)
    .setWipeKey(key)
    .setFreezeKey(key)
    .setPauseKey(key)
    .setSupplyKey(key)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(params.maxSupply)
    .setTreasuryAccountId(treasury)
    .setAutoRenewAccountId(treasury)
    .setAutoRenewPeriod(7000000)
    .freezeWithSigner(params.signer);

  const response = await createNFTTransaction.executeWithSigner(params.signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.CreateToken);
  return response;
}

interface AssociateTokenParams {
  tokenId: string;
  accountId: string;
  signer: HashConnectSigner;
}

async function associateTokenToWallet(params: AssociateTokenParams) {
  const { tokenId, accountId, signer } = params;
  const tokenAssociateTx = new TokenAssociateTransaction().setAccountId(accountId).setTokenIds([tokenId]);
  const tokenAssociateSignedTx = await tokenAssociateTx.freezeWithSigner(signer);
  const response = await tokenAssociateSignedTx.executeWithSigner(signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.AssociateToken);
  return response;
}
interface SetNFTAllowanceParams {
  tokenId: string;
  nftSerialId: number;
  spenderContractId: string;
  walletId: string;
  signer: HashConnectSigner;
}

async function setNFTAllowance(params: SetNFTAllowanceParams) {
  const { tokenId, nftSerialId, spenderContractId, walletId, signer } = params;
  const nftId = new NftId(TokenId.fromString(tokenId), nftSerialId);
  const nftAllowanceTxn = new AccountAllowanceApproveTransaction().approveTokenNftAllowance(
    nftId,
    walletId,
    spenderContractId
  );
  const tokenAllowanceSignedTx = await nftAllowanceTxn.freezeWithSigner(signer);
  const response = await tokenAllowanceSignedTx.executeWithSigner(signer);
  checkTransactionResponseForError(response, TokenServiceFunctions.SetNFTAllowance);
}

const TokenService = {
  createToken,
  setTokenAllowance,
  createNFT,
  setTokenAllowanceForAddLiquidity,
  setHbarTokenAllowance,
  setHbarTokenAllowanceForAddLiquidity,
  associateTokenToWallet,
  setNFTAllowance,
};

export default TokenService;

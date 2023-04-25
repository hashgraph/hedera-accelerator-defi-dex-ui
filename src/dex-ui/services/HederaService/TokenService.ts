import { AccountId, TokenCreateTransaction, AccountAllowanceApproveTransaction } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { checkTransactionResponseForError } from "./utils";

export enum TokenServiceFunctions {
  CreateToken = "createToken",
  SetTokenAllowance = "setTokenAllowance",
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
  decimals: number;
  treasuryAccountId: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
async function createToken(params: CreateTokenParams) {
  const treasury = AccountId.fromString(params.treasuryAccountId);
  const createTokenTransaction = await new TokenCreateTransaction()
    .setTokenName(params.name)
    .setTokenSymbol(params.symbol)
    .setInitialSupply(params.initialSupply)
    .setDecimals(params.decimals)
    .setTreasuryAccountId(treasury)
    .setAutoRenewAccountId(treasury)
    .setAutoRenewPeriod(7000000)
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

const TokenService = {
  createToken,
  setTokenAllowance,
};

export default TokenService;

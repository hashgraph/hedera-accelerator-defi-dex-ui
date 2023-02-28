import { AccountId, TokenCreateTransaction } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { checkTransactionResponseForError } from "./utils";

export enum TokenServiceFunctions {
  CreateToken = "createToken",
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

const TokenService = {
  createToken,
};

export default TokenService;

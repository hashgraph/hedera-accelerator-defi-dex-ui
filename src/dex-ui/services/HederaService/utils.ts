import { TREASURY_ID, TREASURY_KEY, TOKEN_USER_ID, TOKEN_USER_KEY } from "../constants";
import { PrivateKey, Client, AccountId, TransactionResponse, TransactionReceipt } from "@hashgraph/sdk";
import { isNil } from "ramda";

const treasuryId = AccountId.fromString(TREASURY_ID);
const treasuryKey = PrivateKey.fromString(TREASURY_KEY);

const userId = AccountId.fromString(TOKEN_USER_ID);
const userKey = PrivateKey.fromString(TOKEN_USER_KEY);

const getTreasurer = () => {
  return {
    treasuryId,
    treasuryKey,
  };
};

const getUser = () => {
  return {
    userId,
    userKey,
  };
};

const createClient = (accountId: AccountId, privateKey: PrivateKey): Client => {
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);
  return client;
};

const createTreasuryClient = (): Client => {
  return createClient(treasuryId, treasuryKey);
};

const createUserClient = (): Client => {
  return createClient(userId, userKey);
};

const client = createUserClient();

const checkTransactionResponseForError = (response: TransactionResponse | TransactionReceipt, functionName: string) => {
  if (isNil(response)) throw new Error(`${functionName} transaction failed.`);
};

export {
  client,
  checkTransactionResponseForError,
  getTreasurer,
  getUser,
  createClient,
  createTreasuryClient,
  createUserClient,
};

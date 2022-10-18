import { AccountId, PrivateKey, Client } from "@hashgraph/sdk";
import { ADMIN_ID, ADMIN_KEY, TREASURY_ID, TREASURY_KEY, TOKEN_USER_ID, TOKEN_USER_KEY } from "../constants";

const adminId = AccountId.fromString(ADMIN_ID);
const adminKey = PrivateKey.fromString(ADMIN_KEY);

const treasuryId = AccountId.fromString(TREASURY_ID);
const treasuryKey = PrivateKey.fromString(TREASURY_KEY);

const userId = AccountId.fromString(TOKEN_USER_ID);
const userKey = PrivateKey.fromString(TOKEN_USER_KEY);

export const getAdmin = () => {
  return {
    adminId,
    adminKey,
  };
};

export const getTreasurer = () => {
  return {
    treasuryId,
    treasuryKey,
  };
};

export const getUser = () => {
  return {
    userId,
    userKey,
  };
};

// export const getOperator = () => [userId, userKey];

export const createClient = (accountId: AccountId, privateKey: PrivateKey): Client => {
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);
  return client;
};

export const createAdminClient = (): Client => {
  return createClient(adminId, adminKey);
};

export const createTreasuryClient = (): Client => {
  return createClient(treasuryId, treasuryKey);
};

export const createUserClient = (): Client => {
  return createClient(userId, userKey);
};

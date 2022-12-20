import { ADMIN_ID, ADMIN_KEY, TREASURY_ID, TREASURY_KEY, TOKEN_USER_ID, TOKEN_USER_KEY } from "../constants";
import {
  PrivateKey,
  Client,
  AccountId,
  ContractId,
  ContractCallQuery,
  ContractFunctionParameters,
  TransactionResponse,
  ContractFunctionResult,
} from "@hashgraph/sdk";
import { isNil } from "ramda";

const adminId = AccountId.fromString(ADMIN_ID);
const adminKey = PrivateKey.fromString(ADMIN_KEY);

const treasuryId = AccountId.fromString(TREASURY_ID);
const treasuryKey = PrivateKey.fromString(TREASURY_KEY);

const userId = AccountId.fromString(TOKEN_USER_ID);
const userKey = PrivateKey.fromString(TOKEN_USER_KEY);

const getAdmin = () => {
  return {
    adminId,
    adminKey,
  };
};

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

const createAdminClient = (): Client => {
  return createClient(adminId, adminKey);
};

const createTreasuryClient = (): Client => {
  return createClient(treasuryId, treasuryKey);
};

const createUserClient = (): Client => {
  return createClient(userId, userKey);
};

/* This function is used to iterate over result of ContractFunctionResult which returning array
 ** it return address as string stored after default values.
 */
const getAddressArray = (contractFunctionResult: ContractFunctionResult) => {
  const tokenCount = contractFunctionResult.getUint256(1);
  const result: string[] = [];
  for (let i = 0; i < Number(tokenCount); i++) {
    result.push(contractFunctionResult.getAddress(i + 2));
  }
  return result;
};

const client = createUserClient();

const queryContract = async (
  contractId: ContractId,
  functionName: string,
  queryParams?: ContractFunctionParameters
) => {
  const gas = 50000;
  const query = new ContractCallQuery().setContractId(contractId).setGas(gas).setFunction(functionName, queryParams);
  const queryPayment = await query.getCost(client);
  query.setMaxQueryPayment(queryPayment);
  return await query.execute(client);
};

const checkTransactionResponseForError = (response: TransactionResponse, functionName: string) => {
  if (isNil(response)) throw new Error(`${functionName} transaction failed.`);
};

export {
  client,
  queryContract,
  checkTransactionResponseForError,
  getAdmin,
  getTreasurer,
  getUser,
  createClient,
  createAdminClient,
  createTreasuryClient,
  createUserClient,
  getAddressArray,
};

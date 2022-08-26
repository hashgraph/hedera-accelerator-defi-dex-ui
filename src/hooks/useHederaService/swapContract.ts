//import dotenv from "dotenv";
import { BigNumber } from "bignumber.js";
import {
  AccountId,
  PrivateKey,
  TokenId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Client,
  TransferTransaction,
} from "@hashgraph/sdk";

//dotenv.config();

export const createClient = () => {
  const myAccountId = "0.0.34833380";
  const privateKey1 = "302e020100300506032b657004220420411127f31025a5";
  const privatekey2 = "f20a32a92f1baf13be0e767d62bffff10db3f5e5599a52da41";
  const myPrivateKey = privateKey1 + privatekey2;

  if (myAccountId == null || myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
  }

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);
  return client;
};

const client = createClient();
let tokenA = TokenId.fromString("0.0.47646195").toSolidityAddress();
let tokenB = TokenId.fromString("0.0.47646196").toSolidityAddress();
const treasure = AccountId.fromString("0.0.47645191").toSolidityAddress();
const treasureKey = PrivateKey.fromString("308ed38983d9d20216d00371e174fe2d475dd32ac1450ffe2edfaab782b32fc5");
const contractId = "0.0.47712695";

const createLiquidityPool = async () => {
  const tokenAQty = new BigNumber(5);
  const tokenBQty = new BigNumber(5);
  console.log(`Creating a pool of ${tokenAQty} units of token A and ${tokenBQty} units of token B.`);
  const liquidityPool = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "initializeContract",
      new ContractFunctionParameters()
        .addAddress(treasure)
        .addAddress(tokenA)
        .addAddress(tokenB)
        .addInt64(tokenAQty)
        .addInt64(tokenBQty)
    )
    .freezeWith(client)
    .sign(treasureKey);
  const liquidityPoolTx = await liquidityPool.execute(client);
  const transferTokenRx = await liquidityPoolTx.getReceipt(client);
  console.log(`Liquidity pool created: ${transferTokenRx.status}`);
  await pairCurrentPosition();
};

const addLiquidity = async () => {
  const tokenAQty = new BigNumber(10);
  const tokenBQty = new BigNumber(10);
  console.log(`Adding ${tokenAQty} units of token A and ${tokenBQty} units of token B to the pool.`);
  const addLiquidityTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "addLiquidity",
      new ContractFunctionParameters()
        .addAddress(treasure)
        .addAddress(tokenA)
        .addAddress(tokenB)
        .addInt64(tokenAQty)
        .addInt64(tokenBQty)
    )
    .freezeWith(client)
    .sign(treasureKey);
  const addLiquidityTxRes = await addLiquidityTx.execute(client);
  const transferTokenRx = await addLiquidityTxRes.getReceipt(client);

  console.log(`Liquidity added status: ${transferTokenRx.status}`);
  await pairCurrentPosition();
};

const removeLiquidity = async () => {
  const tokenAQty = new BigNumber(3);
  const tokenBQty = new BigNumber(3);
  console.log(`Removing ${tokenAQty} units of token A and ${tokenBQty} units of token B from the pool.`);
  const removeLiquidity = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "removeLiquidity",
      new ContractFunctionParameters()
        .addAddress(treasure)
        .addAddress(tokenA)
        .addAddress(tokenB)
        .addInt64(tokenAQty)
        .addInt64(tokenBQty)
    )
    .freezeWith(client)
    .sign(treasureKey);
  const removeLiquidityTx = await removeLiquidity.execute(client);
  const transferTokenRx = await removeLiquidityTx.getReceipt(client);

  console.log(`Liquidity remove status: ${transferTokenRx.status}`);
  await pairCurrentPosition();
};

const swapTokenA = async () => {
  const tokenAQty = new BigNumber(5);
  const tokenBQty = new BigNumber(0);
  // const walletAddress: string = AccountId.fromString("0.0.34728121").toSolidityAddress();
  console.log(`Swapping a ${tokenAQty} units of token A from the pool.`);
  // Need to pass different token B address so that only swap of token A is considered.
  tokenB = TokenId.fromString("0.0.47646100").toSolidityAddress();
  const swapToken = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "swapToken",
      new ContractFunctionParameters()
        .addAddress(treasure)
        .addAddress(tokenA)
        .addAddress(tokenB)
        .addInt64(tokenAQty)
        .addInt64(tokenBQty)
    )
    .freezeWith(client)
    .sign(treasureKey);
  const swapTokenTx = await swapToken.execute(client);
  const transferTokenRx = await swapTokenTx.getReceipt(client);

  console.log(`Swap status: ${transferTokenRx.status}`);
  await pairCurrentPosition();
};

const swapTokenB = async () => {
  const tokenAQty = new BigNumber(0);
  const tokenBQty = new BigNumber(5);
  console.log(`Swapping a ${tokenBQty} units of token B from the pool.`);
  //Need to pass different token A address so that only swap of token B is considered.
  tokenA = TokenId.fromString("0.0.47646100").toSolidityAddress();
  const swapToken = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2000000)
    .setFunction(
      "swapToken",
      new ContractFunctionParameters()
        .addAddress(treasure)
        .addAddress(tokenA)
        .addAddress(tokenB)
        .addInt64(tokenAQty)
        .addInt64(tokenBQty)
    )
    .freezeWith(client)
    .sign(treasureKey);
  const swapTokenTx = await swapToken.execute(client);
  const transferTokenRx = await swapTokenTx.getReceipt(client);

  console.log(`Swap status: ${transferTokenRx.status}`);
  await pairCurrentPosition();
};

const get100LABTokens = async (receivingAccoundId: string) => {
  const tokenQuantity = 100;
  const L49ATokenId = TokenId.fromString("0.0.47646195");
  const L49BTokenId = TokenId.fromString("0.0.47646196");
  const swapContractAccountId = AccountId.fromString("0.0.47645191");
  const targetAccountId = AccountId.fromString(receivingAccoundId);

  console.log(`Moving ${tokenQuantity} units of L49A and L49B from the Swap contract to Wallet.`);

  const transaction = new TransferTransaction()
    .addTokenTransfer(L49ATokenId, swapContractAccountId, -tokenQuantity)
    .addTokenTransfer(L49ATokenId, targetAccountId, tokenQuantity)
    .addTokenTransfer(L49BTokenId, swapContractAccountId, -tokenQuantity)
    .addTokenTransfer(L49BTokenId, targetAccountId, tokenQuantity)
    .freezeWith(client);

  //Sign with the sender account private key
  const signTx = await transaction.sign(treasureKey);

  //Sign with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Obtain the transaction consensus status
  const transactionStatus = receipt.status;

  console.log("The transaction consensus status " + transactionStatus.toString());
};

const pairCurrentPosition = async () => {
  const getPairQty = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("getPairQty")
    .freezeWith(client);
  const getPairQtyTx = await getPairQty.execute(client);
  const response = await getPairQtyTx.getRecord(client);
  const tokenAQty = response.contractFunctionResult?.getInt64(0);
  const tokenBQty = response.contractFunctionResult?.getInt64(1);
  console.log(`${tokenAQty} units of token A and ${tokenBQty} units of token B are present in the pool. \n`);
};

const getContributorTokenShare = async () => {
  const getContributorTokenShare = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("getContributorTokenShare", new ContractFunctionParameters().addAddress(treasure))
    .freezeWith(client);
  const getContributorTokenShareTx = await getContributorTokenShare.execute(client);
  const response = await getContributorTokenShareTx.getRecord(client);
  const tokenAQty = response.contractFunctionResult?.getInt64(0);
  const tokenBQty = response.contractFunctionResult?.getInt64(1);
  return `${tokenAQty} units of token A and ${tokenBQty} units of token B contributed by treasure.`;
  console.log(`${tokenAQty} units of token A and ${tokenBQty} units of token B contributed by treasure.`);
};

const getTokenBalance = async () => {
  const getTokenBalance = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("getPairQty")
    .freezeWith(client);
  const getTokenBalanceTx = await getTokenBalance.execute(client);
  const response = await getTokenBalanceTx.getRecord(client);
  const tokenAQty = response.contractFunctionResult?.getInt64(0);
  const tokenBQty = response.contractFunctionResult?.getInt64(1);
  return { tokenAQty, tokenBQty };
  // return `${tokenAQty} units of token A and ${tokenBQty} units of token B in Contract balance.`
  // console.log(
  //   `${tokenAQty} units of token A and ${tokenBQty} units of token B contributed by treasure.`
  // );
};

async function main() {
  await createLiquidityPool();
  await addLiquidity();
  await removeLiquidity();
  await swapTokenA();
  await getContributorTokenShare();
}

export {
  main,
  get100LABTokens,
  createLiquidityPool,
  addLiquidity,
  removeLiquidity,
  swapTokenA,
  swapTokenB,
  getContributorTokenShare,
  getTokenBalance,
};

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

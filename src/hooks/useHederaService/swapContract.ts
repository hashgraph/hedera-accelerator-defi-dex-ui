import { BigNumber } from "bignumber.js";
import {
  AccountId,
  ContractId,
  PrivateKey,
  TokenId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Client,
  TransferTransaction,
} from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/provider/signer";
import { SWAP_CONTRACT_ID, L49A_TOKEN_ID, L49B_TOKEN_ID, TREASURY_ID, TREASURY_KEY } from "../useHashConnect/constants";

export interface AddLiquidityDetails {
  firstTokenAddress: string;
  firstTokenQuantity: BigNumber;
  secondTokenAddress: string;
  secondTokenQuantity: BigNumber;
  addLiquidityContractAddress: ContractId;
  walletAddress: string;
  signer: HashConnectSigner;
}

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
let tokenA = TokenId.fromString(L49A_TOKEN_ID).toSolidityAddress();
let tokenB = TokenId.fromString(L49B_TOKEN_ID).toSolidityAddress();
const treasure = AccountId.fromString(TREASURY_ID).toSolidityAddress();
const treasureKey = PrivateKey.fromString(TREASURY_KEY);
const contractId = SWAP_CONTRACT_ID; // "0.0.47712695";

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

const addLiquidity = async (addLiquidityDetails?: AddLiquidityDetails) => {
  const {
    firstTokenAddress,
    firstTokenQuantity,
    secondTokenAddress,
    secondTokenQuantity,
    addLiquidityContractAddress,
    walletAddress,
    signer,
  } = addLiquidityDetails
    ? addLiquidityDetails
    : {
        firstTokenAddress: null,
        firstTokenQuantity: null,
        secondTokenAddress: null,
        secondTokenQuantity: null,
        addLiquidityContractAddress: null,
        walletAddress: null,
        signer: null,
      };

  // TODO: remove fallbacks if no signer and not all details are provided
  const firstTokenAddr = firstTokenAddress ? firstTokenAddress : tokenA;
  const secondTokenAddr = secondTokenAddress ? secondTokenAddress : tokenB;
  const firstTokenQty = firstTokenQuantity ? firstTokenQuantity : new BigNumber(10);
  const secondTokenQty = secondTokenQuantity ? secondTokenQuantity : new BigNumber(10);
  const addLiquidityContractId = addLiquidityContractAddress ? addLiquidityContractAddress : contractId;
  const fromAddress = walletAddress ? walletAddress : treasure;

  console.log(`Adding ${firstTokenQty} units of token A and ${secondTokenQty} units of token B to the pool.`);

  const addLiquidityTxParams = new ContractExecuteTransaction()
    .setContractId(addLiquidityContractId)
    .setGas(2000000)
    .setFunction(
      "addLiquidity",
      new ContractFunctionParameters()
        .addAddress(fromAddress)
        .addAddress(firstTokenAddr)
        .addAddress(secondTokenAddr)
        .addInt64(firstTokenQty)
        .addInt64(secondTokenQty)
    );

  if (signer) {
    const addLiquidityTxWalletSigned = await addLiquidityTxParams.freezeWithSigner(signer);
    const addLiquidityTxWalletSignedRes = await addLiquidityTxWalletSigned.executeWithSigner(signer);
    console.log(addLiquidityTxWalletSignedRes);

    // TODO: for some reason this gives the error: addLiquidityTxWalletSignedRes.getReceiptWithSigner is not a function
    // const addLiquidityTxWalletSignedReceipt = await addLiquidityTxWalletSignedRes.getReceiptWithSigner(signer)
    // console.log(`Liquidity added status: ${addLiquidityTxWalletSignedReceipt.status}`);
  } else {
    const addLiquidityTx = await addLiquidityTxParams.freezeWith(client).sign(treasureKey);
    const addLiquidityTxRes = await addLiquidityTx.execute(client);
    const transferTokenRx = await addLiquidityTxRes.getReceipt(client);
    console.log(`Liquidity added status: ${transferTokenRx.status}`);
  }

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

const getSpotPrice = async () => {
  const getSpotPrice = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("getSpotPrice")
    .freezeWith(client);
  const getSpotPriceTransaction = await getSpotPrice.execute(client);
  const response = await getSpotPriceTransaction.getRecord(client);
  const spotPrice = response.contractFunctionResult?.getInt64(0);
  return spotPrice;
};
const getTokenBalance = async () => {
  const getTokenBalance = new ContractExecuteTransaction()
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

// async function main() {
//   await createLiquidityPool();
//   await addLiquidity();
//   await removeLiquidity();
//   await swapTokenA();
//   await getContributorTokenShare();
// }

export {
  get100LABTokens,
  createLiquidityPool,
  addLiquidity,
  removeLiquidity,
  swapTokenA,
  swapTokenB,
  getContributorTokenShare,
  getTokenBalance,
  getSpotPrice,
};

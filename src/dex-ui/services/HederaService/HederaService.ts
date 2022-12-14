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
} from "@hashgraph/sdk";
import {
  SWAP_CONTRACT_ID,
  GovernorProxyContracts,
  TOKEN_A_SYMBOL,
  TOKEN_B_SYMBOL,
  TOKEN_A_ID,
  TOKEN_B_ID,
  TOKEN_SYMBOL_TO_ACCOUNT_ID,
} from "../constants";
import { AddLiquidityDetails, GovernorContractFunctions, PairContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { client, queryContract, getTreasurer } from "./utils";
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
  const tokenA = TokenId.fromString(TOKEN_A_ID).toSolidityAddress();
  const tokenB = TokenId.fromString(TOKEN_B_ID).toSolidityAddress();
  const contractId = ContractId.fromString(SWAP_CONTRACT_ID); // "0.0.47712695";
  let _precision = BigNumber(0);
  const initHederaService = async () => {
    const precision = await fetchPrecision();
    _precision = precision ?? BigNumber(0);
  };

  const getPrecision = () => {
    return _precision;
  };

  const fetchPrecision = async (): Promise<BigNumber | undefined> => {
    const result = await queryContract(contractId, PairContractFunctions.GetPrecision);
    const precision = result?.getInt256(0);
    return precision;
  };

  const withPrecision = (value: number): BigNumber => {
    if (_precision === undefined) {
      throw new Error("Precision is undefined");
    }
    return BigNumber(value).multipliedBy(_precision);
  };

  const createLiquidityPool = async () => {
    const tokenAQty = withPrecision(200);
    const tokenBQty = withPrecision(220);
    console.log(`Creating a pool of ${tokenAQty} units of token A and ${tokenBQty} units of token B.`);
    const liquidityPool = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(2000000)
      .setFunction(
        "initializeContract",
        new ContractFunctionParameters()
          .addAddress(treasuryId.toSolidityAddress())
          .addAddress(tokenA)
          .addAddress(tokenB)
          .addInt64(tokenAQty)
          .addInt64(tokenBQty)
          .addInt256(new BigNumber(10)) //fee
      )
      .freezeWith(client)
      .sign(treasuryKey);
    const liquidityPoolTx = await liquidityPool.execute(client);
    const transferTokenRx = await liquidityPoolTx.getReceipt(client);
    console.log(`Liquidity pool created: ${transferTokenRx.status}`);
    await pairCurrentPosition(contractId);
  };

  const addLiquidity = async (addLiquidityDetails: AddLiquidityDetails) => {
    const {
      firstTokenAddress,
      firstTokenQuantity,
      secondTokenAddress,
      secondTokenQuantity,
      addLiquidityContractAddress,
      walletAddress,
      signer,
    } = addLiquidityDetails;

    // TODO: remove fallbacks if no signer and not all details are provided
    const firstTokenAddr = firstTokenAddress ? firstTokenAddress : tokenA;
    const secondTokenAddr = secondTokenAddress ? secondTokenAddress : tokenB;
    const firstTokenQty = firstTokenQuantity ? firstTokenQuantity : new BigNumber(10);
    const secondTokenQty = secondTokenQuantity ? secondTokenQuantity : new BigNumber(10);
    const addLiquidityContractId = addLiquidityContractAddress ? addLiquidityContractAddress : contractId;

    console.log(`Adding ${firstTokenQty} units of token A and ${secondTokenQty} units of token B to the pool.`);

    const addLiquidityTransaction = await new ContractExecuteTransaction()
      .setContractId(addLiquidityContractId)
      .setGas(9000000)
      .setFunction(
        "addLiquidity",
        new ContractFunctionParameters()
          .addAddress(walletAddress)
          .addAddress(firstTokenAddr)
          .addAddress(secondTokenAddr)
          .addInt256(firstTokenQty)
          .addInt256(secondTokenQty)
      )
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);

    const result = await addLiquidityTransaction.executeWithSigner(signer);
    console.log(result);
  };

  const removeLiquidity = async (signer: HashConnectSigner, lpTokenAmount: BigNumber, _contractId = contractId) => {
    const accountId = signer.getAccountId().toSolidityAddress();
    console.log(`Removing ${lpTokenAmount} units of LP from the pool.`);
    const removeLiquidity = await new ContractExecuteTransaction()
      .setContractId(_contractId)
      .setGas(2000000)
      .setFunction("removeLiquidity", new ContractFunctionParameters().addAddress(accountId).addInt256(lpTokenAmount))
      .freezeWithSigner(signer);
    const removeLiquidityTx = await removeLiquidity.executeWithSigner(signer);

    console.log(`Liquidity remove Tx: ${removeLiquidityTx}`);
    return removeLiquidityTx;
  };

  const swapToken = async ({
    abstractSwapId,
    walletAddress,
    tokenToTradeAddress,
    tokenToReceiveAddress,
    tokenToTradeAmount,
    tokenToReceiveAmount,
  }: any) => {
    const swapTransaction = await new ContractExecuteTransaction()
      .setContractId(abstractSwapId)
      .setGas(2000000)
      .setFunction(
        "swapToken",
        new ContractFunctionParameters()
          .addAddress(walletAddress)
          .addAddress(tokenToTradeAddress)
          .addAddress(tokenToReceiveAddress)
          .addInt256(tokenToTradeAmount)
          .addInt256(tokenToReceiveAmount)
      )
      .freezeWith(client)
      .sign(treasuryKey);
    const swapTokenTx = await swapTransaction.execute(client);
    const transferTokenRx = await swapTokenTx.getReceipt(client);

    console.log(`Swap status: ${transferTokenRx.status}`);
  };

  interface CreateProposalParams {
    targets: Array<string>;
    fees: Array<number>;
    calls: Array<Uint8Array>;
    description: string;
    signer: HashConnectSigner;
  }

  const createProposal = async ({
    targets,
    fees,
    calls,
    description,
    signer,
  }: CreateProposalParams): Promise<TransactionResponse> => {
    const contractCallParams = new ContractFunctionParameters()
      .addAddressArray(targets)
      .addUint256Array(fees)
      .addBytesArray(calls)
      .addString(description);
    const createProposalTransaction = await new ContractExecuteTransaction()
      .setContractId(GovernorProxyContracts.TransferTokenContractId)
      .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
      .setGas(900000)
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);
    const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
    return proposalTransactionResponse;
  };

  const get100LABTokens = async (
    receivingAccoundId: string,
    hashconnect: any,
    hashConnectState: any,
    network: string
  ) => {
    const tokenQuantity = withPrecision(100).toNumber();
    const L49ATokenId = TokenId.fromString(TOKEN_A_ID);
    const L49BTokenId = TokenId.fromString(TOKEN_B_ID);
    const targetAccountId = AccountId.fromString(receivingAccoundId);

    const { walletData } = hashConnectState;
    const signingAccount = walletData.pairedAccounts[0];
    const provider = hashconnect.getProvider(network, walletData.topicID, signingAccount);
    const signer = hashconnect.getSigner(provider);

    const associatedTokenIds = walletData.pairedAccountBalance.tokens.map((token: any) => token.tokenId);
    const tokensToAssociate = [
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(TOKEN_A_SYMBOL),
      TOKEN_SYMBOL_TO_ACCOUNT_ID.get(TOKEN_B_SYMBOL),
    ].reduce((_tokensToAssociate: string[], tokenId: string | undefined) => {
      if (!associatedTokenIds.includes(tokenId)) {
        _tokensToAssociate.push(tokenId || "");
      }
      return _tokensToAssociate;
    }, []);

    if (tokensToAssociate.length > 0) {
      const tokenAssociateTx = new TokenAssociateTransaction()
        .setAccountId(receivingAccoundId)
        .setTokenIds(tokensToAssociate);

      console.log(`Associating ${TOKEN_A_SYMBOL} and Token ${TOKEN_B_SYMBOL} with connected wallet`);

      const tokenAssociateSignedTx = await tokenAssociateTx.freezeWithSigner(signer);
      const tokenAssociateRes = await tokenAssociateSignedTx.executeWithSigner(signer);

      console.log(`Associate ${TOKEN_A_SYMBOL} and Token SymbolB0 transaction result:`, tokenAssociateRes);
    }

    console.log(
      `Moving ${tokenQuantity} units of ${TOKEN_B_SYMBOL} and Token SymbolB0 from the Swap contract to Wallet.`
    );

    const transaction = new TransferTransaction()
      .addTokenTransfer(L49ATokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49ATokenId, targetAccountId, tokenQuantity)
      .addTokenTransfer(L49BTokenId, treasuryId, -tokenQuantity)
      .addTokenTransfer(L49BTokenId, targetAccountId, tokenQuantity)
      .freezeWith(client);

    //Sign with the sender account private key
    const signTx = await transaction.sign(treasuryKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The transfer transaction consensus status " + transactionStatus.toString());
  };

  // TODO: will need to pass in contractId in future when there are more pools
  const pairCurrentPosition = async (_contractId: ContractId = contractId) => {
    const result = await queryContract(_contractId, PairContractFunctions.GetPoolBalances);
    const tokenAQty = result?.getInt256(0);
    const tokenBQty = result?.getInt256(1);
    // TODO: dont hardcodethis, will have to be dynamic
    return { [TOKEN_A_SYMBOL]: tokenAQty, [TOKEN_B_SYMBOL]: tokenBQty };
  };

  const getContributorTokenShare = async (): Promise<{
    tokenAQty: BigNumber;
    tokenBQty: BigNumber;
  }> => {
    const queryParams = new ContractFunctionParameters().addAddress(treasuryId.toSolidityAddress());
    const result = await queryContract(contractId, PairContractFunctions.GetLiquidityProviderTokenAmounts, queryParams);
    const tokenAQty = result?.getInt64(0);
    const tokenBQty = result?.getInt64(1);
    return { tokenAQty, tokenBQty };
  };

  const getSpotPrice = async (): Promise<BigNumber> => {
    const result = await queryContract(contractId, PairContractFunctions.GetSpotPrice);
    const spotPrice = result?.getInt64(0);
    return spotPrice;
  };

  const fetchFeeWithPrecision = async (): Promise<BigNumber | undefined> => {
    const fee = await fetchFee();
    const feePrecision = await fetchFeePrecision();
    if (feePrecision === undefined) {
      throw new Error("fee precision is undefined");
    }
    return fee?.div(feePrecision.times(10));
  };

  const fetchFee = async (): Promise<BigNumber | undefined> => {
    const result = await queryContract(contractId, PairContractFunctions.GetFee);
    const fee = result?.getInt256(0);
    const feePrecision = await fetchFeePrecision();
    return fee?.div(feePrecision?.toNumber() ?? 1);
  };

  const fetchFeePrecision = async (): Promise<BigNumber | undefined> => {
    const result = await queryContract(contractId, PairContractFunctions.GetFeePrecision);
    const feePrecision = result?.getInt256(0);
    return feePrecision;
  };

  const getTokenBalances = async (): Promise<{
    amountOfTokenA: BigNumber | undefined;
    amountOfTokenB: BigNumber | undefined;
  }> => {
    const result = await queryContract(contractId, PairContractFunctions.GetPoolBalances);
    const amountOfTokenA = result?.getInt256(0);
    const amountOfTokenB = result?.getInt256(1);
    return { amountOfTokenA, amountOfTokenB };
  };

  const getContractAddress = async (): Promise<string> => {
    const result = await queryContract(contractId, PairContractFunctions.GetContractAddress);
    const contractAddress = AccountId.fromSolidityAddress(result?.getAddress(0) ?? "").toString();
    return contractAddress;
  };

  const getTokenPairAddress = async (): Promise<{
    tokenAAddress: string;
    tokenBAddress: string;
  }> => {
    const result = await queryContract(contractId, PairContractFunctions.GetTokenAddresses);
    const tokenAAddress = AccountId.fromSolidityAddress(result?.getAddress(0) ?? "").toString();
    const tokenBAddress = AccountId.fromSolidityAddress(result?.getAddress(1) ?? "").toString();
    return { tokenAAddress, tokenBAddress };
  };

  return {
    initHederaService,
    get100LABTokens,
    getPrecision,
    createLiquidityPool,
    swapToken,
    addLiquidity,
    removeLiquidity,
    createProposal,
    getContributorTokenShare,
    getTokenBalances,
    getSpotPrice,
    fetchFeeWithPrecision,
    fetchFee,
    fetchFeePrecision,
    pairCurrentPosition,
    getContractAddress,
    getTokenPairAddress,
    ...GovernorService,
  };
}

export { createHederaService };
export type { HederaServiceType };

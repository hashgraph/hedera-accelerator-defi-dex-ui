import { BigNumber } from "bignumber.js";
import Web3 from "web3";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransferTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";
import {
  SWAP_CONTRACT_ID,
  GOVERNANCE_PROXY_ID,
  TOKEN_A_SYMBOL,
  TOKEN_B_SYMBOL,
  TOKEN_A_ID,
  TOKEN_B_ID,
  TOKEN_SYMBOL_TO_ACCOUNT_ID,
} from "../constants";
import { AddLiquidityDetails, CreateProposalParams } from "./types";
import { HashConnectSigner } from "hashconnect/dist/provider/signer";
import { createUserClient, getTreasurer } from "./utils";
import govenorAbi from "../abi/GovernorCountingSimpleInternal.json";

type HederaServiceType = ReturnType<typeof createHederaService>;

function createHederaService() {
  const client = createUserClient();
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
    const getPrecisionValueTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getPrecisionValue", new ContractFunctionParameters())
      .freezeWith(client);
    const getPrecisionValueTxRes = await getPrecisionValueTx.execute(client);
    const response = await getPrecisionValueTxRes.getRecord(client);
    const precisionLocal = response.contractFunctionResult?.getInt256(0);
    console.log(`getPrecisionValue ${Number(precisionLocal)}`);
    return precisionLocal;
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

  /**
   * Decodes event contents using the ABI definition of the event
   * @param eventName - the name of the event
   * @param log - log data as a Hex string
   * @param topics - an array of event topics
   */
  const decodeEvent = (eventName: any, log: any, topics: any) => {
    const web3 = new Web3();

    const abi = govenorAbi.abi;
    const eventAbi = abi.find((event: any) => event.name === eventName && event.type === "event");
    console.log(eventAbi);
    if (eventAbi?.inputs === undefined) {
      return undefined;
    }
    const decodedLog = web3.eth.abi.decodeLog(eventAbi?.inputs, log, topics);
    return decodedLog;
  };

  const getEventsFromRecord = (record: any, eventName: string): Promise<Array<any>> => {
    console.log(`\nGetting event(s) `);

    // the events from the function call are in record.contractFunctionResult.logs.data
    // let's parse the logs using web3.js
    // there may be several log entries
    return record.map((log: any) => {
      // convert the log.data (uint8Array) to a string
      const logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

      // get topics from log
      const logTopics: Array<string> = [];
      log.topics.forEach((topic: string) => {
        logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
      });

      // decode the event data
      const event = decodeEvent(eventName, logStringHex, logTopics.slice(1));

      // output the from address stored in the event
      return event;
    });
  };

  const createProposal = async ({ targets, fees, calls, description, signer }: CreateProposalParams) => {
    const createProposalParams = new ContractFunctionParameters()
      .addAddressArray(targets)
      .addUint256Array(fees)
      .addBytesArray(calls)
      .addString(description);

    const createProposalTransaction = await new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(GOVERNANCE_PROXY_ID))
      .setFunction("propose", createProposalParams)
      .setGas(900000)
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);

    const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
    return proposalTransactionResponse;
  };

  const getProposalState = async (proposalId: any) => {
    const contractCallParams = new ContractFunctionParameters().addUint256(proposalId);
    const proposalStateContractCall = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(GOVERNANCE_PROXY_ID))
      .setGas(1000000)
      .setFunction("state", contractCallParams)
      .freezeWith(client);

    const response = await proposalStateContractCall.execute(client);
    const record = await response.getRecord(client);
    const proposalStatus = record.contractFunctionResult?.getUint256(0);
    console.log("contract message: " + proposalStatus);
    return proposalStatus;
  };

  const getProposalVotes = async (proposalId: any) => {
    const contractCallParams = new ContractFunctionParameters().addUint256(proposalId);
    const proposalVotesContractCall = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(GOVERNANCE_PROXY_ID))
      .setGas(1000000)
      .setFunction("proposalVotes", contractCallParams)
      .freezeWith(client);
    const response = await proposalVotesContractCall.execute(client);
    const record = await response.getRecord(client);
    const againstVotes = record.contractFunctionResult?.getInt256(0);
    const forVotes = record.contractFunctionResult?.getInt256(1);
    const abstainVotes = record.contractFunctionResult?.getInt256(2);
    console.log("contract message: " + { againstVotes, forVotes, abstainVotes });
    return { againstVotes, forVotes, abstainVotes };
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
    const getPairQty = new ContractExecuteTransaction()
      .setContractId(_contractId)
      .setGas(1000000)
      .setFunction("getPairQty")
      .freezeWith(client);
    const getPairQtyTx = await getPairQty.execute(client);
    const response = await getPairQtyTx.getRecord(client);
    const tokenAQty = response.contractFunctionResult?.getInt256(0);
    const tokenBQty = response.contractFunctionResult?.getInt256(1);
    console.log(`${tokenAQty} units of token A and ${tokenBQty} units of token B are present in the pool. \n`);
    // TODO: dont hardcodethis, will have to be dynamic
    return { [TOKEN_A_SYMBOL]: tokenAQty, [TOKEN_B_SYMBOL]: tokenBQty };
  };

  const getContributorTokenShare = async () => {
    const getContributorTokenShare = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
        "getContributorTokenShare",
        new ContractFunctionParameters().addAddress(treasuryId.toSolidityAddress())
      )
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
    console.log(getSpotPriceTransaction);
    const response = await getSpotPriceTransaction.getRecord(client);
    console.log(response);
    const spotPrice = response.contractFunctionResult?.getInt64(0);
    return spotPrice;
  };

  const fetchFeeWithPrecision = async () => {
    const fee = await fetchFee();
    const feePrecision = await fetchFeePrecision();
    if (feePrecision === undefined) {
      throw new Error("fee precision is undefined");
    }
    return fee?.div(feePrecision.times(10));
  };

  const fetchFee = async (): Promise<BigNumber | undefined> => {
    const getFee = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getFee")
      .freezeWith(client);
    const getPoolFeeTransaction = await getFee.execute(client);
    const response = await getPoolFeeTransaction.getRecord(client);
    const fee = response.contractFunctionResult?.getInt256(0);
    const feePrecision = await fetchFeePrecision();
    return fee?.div(feePrecision?.toNumber() ?? 1);
  };

  const fetchFeePrecision = async (): Promise<BigNumber | undefined> => {
    const getFeePrecision = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getFeePrecision")
      .freezeWith(client);
    const getFeePrecisionTransaction = await getFeePrecision.execute(client);
    const response = await getFeePrecisionTransaction.getRecord(client);
    const feePrecision = response.contractFunctionResult?.getInt256(0);
    return feePrecision;
  };

  const getTokenBalances = async (): Promise<{
    amountOfTokenA: BigNumber | undefined;
    amountOfTokenB: BigNumber | undefined;
  }> => {
    const getTokenBalance = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getPairQty")
      .freezeWith(client);
    const getTokenBalanceTx = await getTokenBalance.execute(client);
    const response = await getTokenBalanceTx.getRecord(client);
    const amountOfTokenA = response.contractFunctionResult?.getInt256(0);
    const amountOfTokenB = response.contractFunctionResult?.getInt256(1);
    return { amountOfTokenA, amountOfTokenB };
  };

  const getContractAddress = async () => {
    const getContractAddress = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getContractAddress")
      .freezeWith(client);
    const getContractAddressTransaction = await getContractAddress.execute(client);
    const response = await getContractAddressTransaction.getRecord(client);
    const contractAddress = AccountId.fromSolidityAddress(
      response.contractFunctionResult?.getAddress(0) ?? ""
    ).toString();
    console.log(contractAddress);
  };

  const getTokenPairAddress = async () => {
    const getTokenPairAddress = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("getTokenPairAddress")
      .freezeWith(client);
    const getTokenPairAddressTransaction = await getTokenPairAddress.execute(client);
    const response = await getTokenPairAddressTransaction.getRecord(client);
    const tokenAAddress = AccountId.fromSolidityAddress(
      response.contractFunctionResult?.getAddress(0) ?? ""
    ).toString();
    const tokenBAddress = AccountId.fromSolidityAddress(
      response.contractFunctionResult?.getAddress(1) ?? ""
    ).toString();
    console.log(tokenAAddress, tokenBAddress);
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
    getProposalState,
    getProposalVotes,
    getContributorTokenShare,
    getTokenBalances,
    getSpotPrice,
    fetchFeeWithPrecision,
    fetchFee,
    fetchFeePrecision,
    pairCurrentPosition,
    getContractAddress,
    getTokenPairAddress,
  };
}

export { createHederaService };
export type { HederaServiceType };

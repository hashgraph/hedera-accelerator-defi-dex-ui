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
  ContractCallQuery,
  TokenInfoQuery,
} from "@hashgraph/sdk";
import {
  SWAP_CONTRACT_ID,
  GOVERNOR_PROXY_CONTRACT,
  TOKEN_A_SYMBOL,
  TOKEN_B_SYMBOL,
  TOKEN_A_ID,
  TOKEN_B_ID,
  TOKEN_SYMBOL_TO_ACCOUNT_ID,
  FACTORY_CONTRACT_ID,
} from "../constants";
import { AddLiquidityDetails, GovernorContractFunctions, PairContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { createUserClient, getTreasurer } from "./utils";
import { MirrorNodeService } from "..";

type HederaServiceType = ReturnType<typeof createHederaService>;

function createHederaService() {
  const client = createUserClient();
  const { treasuryId, treasuryKey } = getTreasurer();
  const tokenA = TokenId.fromString(TOKEN_A_ID).toSolidityAddress();
  const tokenB = TokenId.fromString(TOKEN_B_ID).toSolidityAddress();
  const contractId = ContractId.fromString(SWAP_CONTRACT_ID); // "0.0.47712695";
  const factoryId = ContractId.fromString(FACTORY_CONTRACT_ID); //
  let _precision = BigNumber(0);

  const initHederaService = async () => {
    const precision = await fetchPrecision();
    _precision = precision ?? BigNumber(0);
  };

  const getTokenPairs = async () => {
    const result = await queryContract(factoryId, PairContractFunctions.GetTokenPair);
    const evmAddress = result?.getAddress(0) ?? "";
    if (!evmAddress) return;
    try {
      const {
        data: { contract_id },
      } = await MirrorNodeService.fetchContract(evmAddress);
      const id = ContractId.fromString(contract_id); //0.0.48946274
      const { tokenAAddress, tokenBAddress } = await getTokenPairAddress(id);

      const tokenAInfo = await new TokenInfoQuery().setTokenId(tokenAAddress).execute(client);

      const tokenBInfo = await new TokenInfoQuery().setTokenId(tokenBAddress).execute(client);

      // TODO: To be Saved in Store
      const tokenAInfoDetails = {
        tokenId: tokenAInfo.tokenId,
        tokenType: tokenAInfo.tokenType,
        tokenName: tokenAInfo.name,
        tokenSupply: tokenAInfo.totalSupply,
        tokenMaxSpply: tokenAInfo.maxSupply,
        tokenSymbol: tokenAInfo.symbol,
      };

      // TODO: To be Saved in Store
      const tokenBInfoDetails = {
        tokenId: tokenBInfo.tokenId,
        tokenType: tokenBInfo.tokenType,
        tokenName: tokenBInfo.name,
        tokenSupply: tokenBInfo.totalSupply,
        tokenMaxSpply: tokenBInfo.maxSupply,
        tokenSymbol: tokenBInfo.symbol,
      };

      // TODO: To be removed
      console.info(`- Token A Info: ${tokenAInfoDetails.tokenName} and ${tokenAInfoDetails.tokenSupply}`);
      console.info(`- Token B Info: ${tokenBInfoDetails.tokenName} and ${tokenBInfoDetails.tokenSupply}`);
    } catch (error) {
      console.log("Error while fetching...", error);
    }
  };

  const getPrecision = () => {
    return _precision;
  };

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
      .setContractId(GOVERNOR_PROXY_CONTRACT.ContractId)
      .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
      .setGas(900000)
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);
    const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
    return proposalTransactionResponse;
  };

  const castVote = async ({ proposalId, voteType, signer }: any) => {
    const contractFunctionParameters = new ContractFunctionParameters().addUint256(proposalId).addUint8(voteType);
    const castVoteTransaction = await new ContractExecuteTransaction()
      .setContractId(GOVERNOR_PROXY_CONTRACT.ContractId)
      .setFunction(GovernorContractFunctions.CastVote, contractFunctionParameters)
      .setGas(900000)
      .setNodeAccountIds([new AccountId(3)])
      .freezeWithSigner(signer);

    const response = await castVoteTransaction.executeWithSigner(signer);
    return response;
  };

  const fetchProposalState = async (proposalId: BigNumber): Promise<BigNumber | undefined> => {
    const queryParams = new ContractFunctionParameters().addUint256(proposalId);
    const result = await queryContract(
      GOVERNOR_PROXY_CONTRACT.ContractId,
      GovernorContractFunctions.GetState,
      queryParams
    );
    const proposalStatus = result?.getUint256(0);
    return proposalStatus;
  };

  const fetchQuorum = async (blockNumber: BigNumber): Promise<BigNumber | undefined> => {
    const queryParams = new ContractFunctionParameters().addUint256(blockNumber);
    const result = await queryContract(
      GOVERNOR_PROXY_CONTRACT.ContractId,
      GovernorContractFunctions.GetQuorum,
      queryParams
    );
    const quorum = result?.getInt256(0);
    return quorum;
  };
  interface ProposalVotes {
    againstVotes: BigNumber | undefined;
    forVotes: BigNumber | undefined;
    abstainVotes: BigNumber | undefined;
  }

  const fetchProposalVotes = async (proposalId: BigNumber): Promise<ProposalVotes> => {
    const queryParams = new ContractFunctionParameters().addUint256(proposalId);
    const result = await queryContract(
      GOVERNOR_PROXY_CONTRACT.ContractId,
      GovernorContractFunctions.GetProposalVotes,
      queryParams
    );
    const againstVotes = result?.getInt256(0);
    const forVotes = result?.getInt256(1);
    const abstainVotes = result?.getInt256(2);
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

  const getTokenPairAddress = async (
    contractId: ContractId
  ): Promise<{
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
    fetchQuorum,
    fetchProposalState,
    fetchProposalVotes,
    getContributorTokenShare,
    getTokenBalances,
    getSpotPrice,
    fetchFeeWithPrecision,
    fetchFee,
    fetchFeePrecision,
    pairCurrentPosition,
    getContractAddress,
    getTokenPairAddress,
    castVote,
    getTokenPairs,
  };
}

export { createHederaService };
export type { HederaServiceType };

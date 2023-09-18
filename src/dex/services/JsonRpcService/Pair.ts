import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import Pair from "../abi/Pair.json";
import { createContract, checkIfTokenAddressesAreValid, convertEthersBigNumberToBigNumberJS } from "./utils";
import { DexService } from "@dex/services";
import { solidityAddressToTokenIdString } from "@shared/utils";

/**
 * Creates an ethers.Contract representation of the Pair contract.
 * @param pairAccountId - The Pair contract account id.
 * @returns An ethers.Contract representation of the Pair contract
 */
function createPairContract(pairAccountId: string): ethers.Contract {
  return createContract(pairAccountId, Pair.abi);
}

type TokenPairAddressResponse = {
  tokenATokenId: string;
  tokenBTokenId: string;
  lpTokenId: string;
  fee: BigNumber;
};

type RawTokenPairAddressResponse = [
  tokenAAddress: string,
  tokenBAddress: string,
  lpTokenAddress: string,
  transactionFee: ethers.BigNumber
];

/**
 * TODO
 */
async function fetchPairTokenIds(pairAccountId: string): Promise<TokenPairAddressResponse> {
  const pairContract = createPairContract(pairAccountId);
  const feePrecisionValue: ethers.BigNumber = await pairContract.getFeePrecision();
  const results: RawTokenPairAddressResponse = await pairContract.getTokenPairAddress();
  const [tokenAAddress, tokenBAddress, lpTokenAddress, transactionFee] = results;

  const fee = convertEthersBigNumberToBigNumberJS(transactionFee);
  const feePrecision = convertEthersBigNumberToBigNumberJS(feePrecisionValue);

  checkIfTokenAddressesAreValid([tokenAAddress, tokenBAddress, lpTokenAddress]);
  const [tokenATokenId, tokenBTokenId, lpTokenId] = [tokenAAddress, tokenBAddress, lpTokenAddress].map(
    solidityAddressToTokenIdString
  );
  return {
    tokenATokenId,
    tokenBTokenId,
    lpTokenId,
    fee: fee.dividedBy(feePrecision).shiftedBy(-2),
  };
}

interface PairTokenBalances {
  tokenAQty: BigNumber;
  tokenBQty: BigNumber;
}

/**
 * TODO
 */
async function fetchPoolTokenBalances(pairAccountId: string): Promise<PairTokenBalances> {
  const pairContract = createPairContract(pairAccountId);
  const [tokenAQty, tokenBQty]: ethers.BigNumber[] = await pairContract.getPairQty();
  return {
    tokenAQty: convertEthersBigNumberToBigNumberJS(tokenAQty),
    tokenBQty: convertEthersBigNumberToBigNumberJS(tokenBQty),
  };
}

type RawPairInfoResponse = [
  tokenPairIds: {
    tokenA: {
      tokenAddress: string;
    };
    tokenB: {
      tokenAddress: string;
    };
  },
  tokenPairDetails: {
    tokenASpotPrice: ethers.BigNumber;
    tokenBSpotPrice: ethers.BigNumber;
    precision: ethers.BigNumber;
    feePrecision: ethers.BigNumber;
    fee: ethers.BigNumber;
  }
];

type PairInfoResponse = {
  tokenATokenId: string;
  tokenBTokenId: string;
  tokenASpotPrice: BigNumber;
  tokenBSpotPrice: BigNumber;
  precision: BigNumber;
  feeWithPrecision: BigNumber;
};

async function getPairInfo(pairAccountId: string): Promise<PairInfoResponse> {
  const pairContract = createPairContract(pairAccountId);
  const pairResponse: RawPairInfoResponse = await pairContract.getPairInfo();
  const [tokenPairIds, tokenPairDetails] = pairResponse;
  checkIfTokenAddressesAreValid([tokenPairIds.tokenA.tokenAddress, tokenPairIds.tokenB.tokenAddress]);
  const feePrecision = convertEthersBigNumberToBigNumberJS(tokenPairDetails.feePrecision);
  const fee = convertEthersBigNumberToBigNumberJS(tokenPairDetails.fee);
  return {
    tokenASpotPrice: convertEthersBigNumberToBigNumberJS(tokenPairDetails.tokenASpotPrice),
    tokenBSpotPrice: convertEthersBigNumberToBigNumberJS(tokenPairDetails.tokenBSpotPrice),
    tokenATokenId: solidityAddressToTokenIdString(tokenPairIds.tokenA.tokenAddress),
    tokenBTokenId: solidityAddressToTokenIdString(tokenPairIds.tokenB.tokenAddress),
    precision: convertEthersBigNumberToBigNumberJS(tokenPairDetails.precision),
    feeWithPrecision: fee.dividedBy(feePrecision).shiftedBy(-2),
  };
}

async function getLpTokenContractId(pairAccountId: string): Promise<string> {
  const pairContract = createPairContract(pairAccountId);
  const evmAddress: string = await pairContract.getLpTokenContractAddress();
  const lpTokenContract = await DexService.fetchLatestContractId(evmAddress);
  checkIfTokenAddressesAreValid([lpTokenContract.toSolidityAddress()]);
  return lpTokenContract.toString();
}

const PairContract = {
  fetchPairTokenIds,
  fetchPoolTokenBalances,
  getPairInfo,
  getLpTokenContractId,
};

export default PairContract;

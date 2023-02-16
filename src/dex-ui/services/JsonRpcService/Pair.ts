import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import Pair from "../abi/Pair.json";
import {
  createContract,
  checkIfTokenAddressesAreValid,
  convertEthersBigNumberToBigNumberJS,
  solidityAddressToTokenIdString,
} from "./utils";

/**
 * Creates an ethers.Contract representation of the Pair contract.
 * @param pairAccountId - The Pair contract account id.
 * @returns An ethers.Contract representation of the Pair contract
 */
function createPairContract(pairAccountId: string): ethers.Contract {
  return createContract(pairAccountId, Pair.abi);
}

/**
 * TODO
 */
async function fetchSpotPrice(pairAccountId: string): Promise<BigNumber> {
  const pairContract = createPairContract(pairAccountId);
  const spotPrice: ethers.BigNumber = await pairContract.getSpotPrice();
  return convertEthersBigNumberToBigNumberJS(spotPrice);
}

interface PairTokenIds {
  tokenATokenId: string;
  tokenBTokenId: string;
  lpTokenId: string;
  transactionFee: BigNumber;
}

/**
 * TODO
 */
async function fetchPairTokenIds(pairAccountId: string): Promise<PairTokenIds> {
  const pairContract = createPairContract(pairAccountId);
  const results: string[] = await pairContract.getTokenPairAddress();
  const newResults = [...results];
  const transactionfee = ethers.BigNumber.from(newResults.pop());
  checkIfTokenAddressesAreValid(newResults);
  const [tokenATokenId, tokenBTokenId, lpTokenId] = newResults.map(solidityAddressToTokenIdString);
  return {
    tokenATokenId,
    tokenBTokenId,
    lpTokenId,
    transactionFee: convertEthersBigNumberToBigNumberJS(transactionfee),
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

/**
 * TODO
 */
async function fetchPrecisionValue(pairAccountId: string): Promise<BigNumber> {
  const pairContract = createPairContract(pairAccountId);
  const precisionValue: ethers.BigNumber = await pairContract.getPrecisionValue();
  return convertEthersBigNumberToBigNumberJS(precisionValue);
}

/**
 * TODO
 */
async function fetchFeePrecision(pairAccountId: string): Promise<BigNumber> {
  const pairContract = createPairContract(pairAccountId);
  const feePrecisionValue: ethers.BigNumber = await pairContract.getFeePrecision();
  return convertEthersBigNumberToBigNumberJS(feePrecisionValue);
}

/**
 * TODO
 */
async function fetchFee(pairAccountId: string): Promise<BigNumber> {
  const pairContract = createPairContract(pairAccountId);
  const fee: ethers.BigNumber = await pairContract.getFee();
  return convertEthersBigNumberToBigNumberJS(fee);
}

/**
 * TODO
 */
async function fetchFeeWithPrecision(pairAccountId: string): Promise<BigNumber> {
  const fee = await fetchFee(pairAccountId);
  const feePrecision = await fetchFeePrecision(pairAccountId);
  /** NOTE: shiftedBy(-2) is added to return the fee as a numeric representation of a percentage value. */
  return fee.dividedBy(feePrecision).shiftedBy(-2);
}

const PairContract = {
  fetchSpotPrice,
  fetchPairTokenIds,
  fetchPoolTokenBalances,
  fetchPrecisionValue,
  fetchFeeWithPrecision,
};

export default PairContract;

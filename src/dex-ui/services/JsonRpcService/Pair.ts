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

type TokenPairAddressResponse = {
  tokenATokenId: string;
  tokenBTokenId: string;
  lpTokenId: string;
  poolFee: BigNumber;
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
    poolFee: fee.dividedBy(feePrecision).shiftedBy(-2),
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

type PairInfo = {
  tokenATokenId: string;
  tokenBTokenId: string;
  tokenASpotPrice: BigNumber;
  tokenBSpotPrice: BigNumber;
  precision: BigNumber;
  feeWithPrecision: BigNumber;
};

async function getPairInfo(pairAccountId: string): Promise<PairInfo> {
  const pairContract = createPairContract(pairAccountId);
  const pairResponse: RawPairInfoResponse = await pairContract.getPairInfo();
  const [tokenPairIds, tokenPairDetails] = pairResponse;

  checkIfTokenAddressesAreValid([tokenPairIds.tokenA.tokenAddress, tokenPairIds.tokenB.tokenAddress]);
  const [tokenATokenId, tokenBTokenId] = [tokenPairIds.tokenA.tokenAddress, tokenPairIds.tokenB.tokenAddress].map(
    solidityAddressToTokenIdString
  );

  const tokenASpotPrice = convertEthersBigNumberToBigNumberJS(tokenPairDetails.tokenASpotPrice);
  const tokenBSpotPrice = convertEthersBigNumberToBigNumberJS(tokenPairDetails.tokenBSpotPrice);
  const precision = convertEthersBigNumberToBigNumberJS(tokenPairDetails.precision);
  const feePrecision = convertEthersBigNumberToBigNumberJS(tokenPairDetails.feePrecision);
  const fee = convertEthersBigNumberToBigNumberJS(tokenPairDetails.fee);
  /** NOTE: shiftedBy(-2) is added to return the fee as a numeric representation of a percentage value. */
  const feeWithPrecision = fee.dividedBy(feePrecision).shiftedBy(-2);

  return {
    tokenASpotPrice,
    tokenBSpotPrice,
    tokenATokenId,
    tokenBTokenId,
    precision,
    feeWithPrecision,
  };
}

const PairContract = {
  fetchPairTokenIds,
  fetchPoolTokenBalances,
  getPairInfo,
};

export default PairContract;

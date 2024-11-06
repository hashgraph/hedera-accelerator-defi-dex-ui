import { ethers } from "ethers";
import { Contracts, DEX_TOKEN_PRECISION_VALUE } from "../constants";
import Factory from "../abi/Factory.json";
import { convertEthersBigNumberToBigNumberJS, createContract } from "./utils";
import { TokenId } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";
import { DexService } from "@dex/services";
import { solidityAddressToTokenIdString } from "@shared/utils";

type RawPairDataResponse = [
  pair: string,
  token: string,
  swappedQty: ethers.BigNumber,
  fee: ethers.BigNumber,
  slippage: ethers.BigNumber
];

type PairDataResponse = {
  pair: string;
  token: string;
  swappedQty: BigNumber;
  fee: BigNumber;
  slippage: BigNumber;
};

interface GetBestSwapPairAvailableProps {
  tokenAAddress: string;
  tokenBAddress: string;
  tokenAQty: number;
}

/**
 * Creates an ethers.Contract representation of the Factory contract.
 * @param governorAccountId - The Factory contract account id.
 * @returns An ethers.Contract representation of the Factory contract
 */
function createFactoryContract(): ethers.Contract {
  return createContract(Contracts.Factory.ProxyId, Factory.abi);
}

/**
 * Fetches all pair contract addresses associated with the DEX.
 * @returns A list of all DEX pair contract addresses.
 */
async function fetchAllTokenPairs(): Promise<string[]> {
  const factoryContract = createFactoryContract();
  const pairContractAddresses: string[] = await factoryContract.getPairs();
  return pairContractAddresses;
}

/**
 * Fetches a pair contract address.
 * @returns A pair contract addresses.
 */
async function getPair(tokenAAddress: string, secondTokenAddress: string, transactionFee: number): Promise<string> {
  const factoryContract = createFactoryContract();
  const address = await factoryContract.getPair(tokenAAddress, secondTokenAddress, transactionFee);
  return address;
}

/**
 * Fetches the best pair available for swap.
 * @returns A pair contract addresses.
 */
async function getBestSwapPairAvailable(params: GetBestSwapPairAvailableProps): Promise<PairDataResponse | undefined> {
  const { tokenAAddress, tokenBAddress, tokenAQty } = params;
  const tokenToTradeAmount = BigNumber(tokenAQty)
    .times((await DexService.fetchTokenData(tokenAAddress)).data.precision)
    .toString();

  const factoryContract = createFactoryContract();
  const pairData: RawPairDataResponse = await factoryContract.recommendedPairToSwap(
    TokenId.fromString(tokenAAddress).toSolidityAddress(),
    TokenId.fromString(tokenBAddress).toSolidityAddress(),
    ethers.BigNumber.from(tokenToTradeAmount)
  );

  const [pair, token, swappedQty, fee, slippage] = pairData;
  const pairContractId = await DexService.fetchLatestContractId(pair);
  return {
    pair: pairContractId.toString(),
    token: solidityAddressToTokenIdString(token),
    swappedQty: convertEthersBigNumberToBigNumberJS(swappedQty).shiftedBy(-DEX_TOKEN_PRECISION_VALUE),
    fee: convertEthersBigNumberToBigNumberJS(fee),
    slippage: convertEthersBigNumberToBigNumberJS(slippage).shiftedBy(-DEX_TOKEN_PRECISION_VALUE),
  };
}

const FactoryContract = {
  fetchAllTokenPairs,
  getPair,
  getBestSwapPairAvailable,
};
export default FactoryContract;

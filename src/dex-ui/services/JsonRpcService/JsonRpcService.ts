import { ethers } from "ethers";
import Pair from "./Pair";
import { AccountId } from "@hashgraph/sdk";
import Factory from "./Factory";
import Governor from "./Governor";
import * as DAOService from "./dao";
import Configuration from "./Configuration";
import { TOKEN_USER_ID } from "../constants";

const JsonRpcHashioUrl = {
  mainnet: "https://mainnet.hashio.io/api",
  testnet: "https://testnet.hashio.io/api",
  previewnet: "https://previewnet.hashio.io/api",
};

type JsonRpcServiceType = ReturnType<typeof createJsonRpcService>;

function getProviderAndSigner(): {
  JsonRpcProvider: ethers.providers.JsonRpcProvider;
  JsonRpcSigner: ethers.providers.JsonRpcSigner;
} {
  const JsonRpcProvider = new ethers.providers.JsonRpcProvider(JsonRpcHashioUrl.testnet);
  /**
   * getSigner() requires any solidity address to be passed in as a parameter.
   * Otherwise, the following error is throw in the console:
   * unknown account #0 (operation="getAddress", code=UNSUPPORTED_OPERATION, version=providers/5.6.4)
   * The root cause of this behavior has not yet been identified.
   */
  const placeholderAddress = AccountId.fromString(TOKEN_USER_ID).toSolidityAddress();
  const JsonRpcSigner = JsonRpcProvider.getSigner(placeholderAddress);
  return { JsonRpcProvider, JsonRpcSigner };
}

const { JsonRpcProvider, JsonRpcSigner } = getProviderAndSigner();

function createJsonRpcService() {
  return {
    ...Factory,
    ...Pair,
    ...Governor,
    ...DAOService,
    ...Configuration,
  };
}

export type { JsonRpcServiceType };
export { createJsonRpcService, JsonRpcProvider, JsonRpcSigner };

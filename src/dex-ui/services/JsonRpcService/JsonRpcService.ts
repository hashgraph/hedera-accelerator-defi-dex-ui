import { ethers } from "ethers";
import Pair from "./Pair";
import { AccountId } from "@hashgraph/sdk";
import Factory from "./Factory";
import Configuration from "./Configuration";
import { TOKEN_USER_ID } from "../constants";

const JsonRpcHashioUrl = {
  mainnet: "https://mainnet.hashio.io/api",
  testnet: "https://testnet.hashio.io/api",
  previewnet: "https://previewnet.hashio.io/api",
};

export type JsonRpcServiceType = ReturnType<typeof createJsonRpcService>;

export function createJsonRpcService(walletAccountId: string = TOKEN_USER_ID) {
  let JsonRpcProvider: ethers.providers.JsonRpcProvider;
  let JsonRpcSigner: ethers.providers.JsonRpcSigner;

  function init(walletAccountId: string = TOKEN_USER_ID) {
    setJsonRpcProviderAndSigner(walletAccountId);
    return {
      ...Factory,
      ...Pair,
      ...Configuration,
      getJsonRpcProviderAndSigner,
      setJsonRpcProviderAndSigner,
    };
  }

  function getJsonRpcProviderAndSigner(): {
    JsonRpcProvider: ethers.providers.JsonRpcProvider;
    JsonRpcSigner: ethers.providers.JsonRpcSigner;
  } {
    return { JsonRpcProvider, JsonRpcSigner };
  }

  function setJsonRpcProviderAndSigner(walletAccountId: string = TOKEN_USER_ID) {
    JsonRpcProvider = new ethers.providers.JsonRpcProvider(JsonRpcHashioUrl.testnet);
    /**
     * getSigner() requires any solidity address to be passed in as a parameter.
     * Otherwise, the following error is throw in the console:
     * unknown account #0 (operation="getAddress", code=UNSUPPORTED_OPERATION, version=providers/5.6.4)
     * The root cause of this behavior has not yet been identified.
     */
    const walletAddress = AccountId.fromString(walletAccountId).toSolidityAddress();
    JsonRpcSigner = JsonRpcProvider.getSigner(walletAddress);
  }

  return init(walletAccountId);
}

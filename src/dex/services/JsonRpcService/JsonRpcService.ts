import { ethers } from "ethers";
import Pair from "./Pair";
import { AccountId, LedgerId } from "@hashgraph/sdk";
import Factory from "./Factory";
import Configuration from "./Configuration";
import { TOKEN_USER_ID } from "../constants";
import { getDefaultLedgerId } from "shared";

const JsonRpcHashioUrl = {
  mainnet: "https://mainnet.hashio.io/api",
  testnet: "https://testnet.hashio.io/api",
  previewnet: "https://previewnet.hashio.io/api",
};

function getJsonRpcUrl(): string {
  const network = getDefaultLedgerId();
  if (network.toString() === LedgerId.MAINNET.toString()) {
    return JsonRpcHashioUrl.mainnet;
  } else if (network.toString() === LedgerId.PREVIEWNET.toString()) {
    return JsonRpcHashioUrl.previewnet;
  }
  return JsonRpcHashioUrl.testnet;
}

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
    JsonRpcProvider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
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

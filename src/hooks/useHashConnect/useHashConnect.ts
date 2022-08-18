import { useEffect, useCallback, Dispatch, useState } from "react";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { BigNumber } from "bignumber.js";
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountId,
  TokenId,
  TransactionId,
  AccountBalanceJson,
  PrivateKey,
  Client,
  ContractId,
  Hbar,
} from "@hashgraph/sdk";
import { ActionType, HashConnectActions } from "./reducers/actionsTypes";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { useHashConnectEvents } from "./useHashConnectEvents";
import { HASHCONNECT_LOCAL_DATA_KEY } from "./constants";
import { WalletConnectionStatus } from "./types";
import { BladeSigner } from "@bladelabs/blade-web3.js";

/*
const dexMetadata: HashConnectTypes.AppMetadata = {
  name: "Hedera Open DEX",
  description: "An example hedera DEX",
  icon: "",
};
*/
const OPERATOR_ACCOUNT_ID = "0.0.47549759";
const OPERATOR_PUBLIC_KEY = "302a300506032b6570032100a1dcb686465f9f4c22baaff9e321f057e82b5081e1d110969e7d512157979ab8";
const OPERATOR_PRIVATE_KEY =
  "302e020100300506032b657004220420ade33088ec47cd9d4ee4d9c9409567a4e39fddc2e4434aa6ace16e3278e253d5";

const operatorId = AccountId.fromString(OPERATOR_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(OPERATOR_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const hashconnect = new HashConnect(true);

export interface UseHashConnectProps {
  hashConnectState: HashConnectState;
  dispatch: Dispatch<HashConnectActions>;
  network: string;
  dexMetaData: HashConnectTypes.AppMetadata;
  debug: boolean;
}

const useHashConnect = ({
  hashConnectState,
  dispatch,
  network = "testnet",
  dexMetaData,
  debug,
}: UseHashConnectProps) => {
  const { walletConnectionStatus, installedExtensions, walletData, selectedWalletName, bladeWallet } = hashConnectState;
  useHashConnectEvents(hashconnect, hashConnectState, dispatch, debug);

  const initWalletConnection = useCallback(async (): Promise<any> => {
    const initData = await hashconnect.init(dexMetaData);
    const privateKey = initData.privKey;
    const nodeConnectionState = await hashconnect.connect();
    const walletPairingString = hashconnect.generatePairingString(nodeConnectionState, network, debug ?? false);
    hashconnect.findLocalWallets();
    return {
      network,
      privateKey: privateKey,
      topicID: nodeConnectionState.topic,
      walletPairingString,
    };
  }, [dexMetaData, network, debug]);

  const pairWallet = useCallback(
    async (hashconnectData: HashConnectState) => {
      const { walletData } = hashconnectData;
      await hashconnect.init(dexMetaData, walletData.privateKey);
      await hashconnect.connect(walletData.topicID, dexMetaData);
    },
    [dexMetaData]
  );

  const saveToLocalStorage = useCallback(() => {
    const hashconnectDataJSON = JSON.stringify(hashConnectState);
    localStorage.setItem(HASHCONNECT_LOCAL_DATA_KEY, hashconnectDataJSON);
  }, [hashConnectState]);

  const establishWalletConnection = useCallback(async () => {
    if (debug) console.log("==== Establish Connection ====");
    try {
      if (walletConnectionStatus === WalletConnectionStatus.INITIALIZING) {
        const updatedHashconnectData = await initWalletConnection();
        dispatch({ type: ActionType.INIT_WALLET_CONNECTION, field: "walletData", payload: updatedHashconnectData });
      } else {
        await pairWallet(hashConnectState);
      }
    } catch (error) {
      console.error(error);
    }
  }, [debug, dispatch, hashConnectState, walletConnectionStatus, initWalletConnection, pairWallet]);

  const connectToWallet = useCallback(() => {
    const hasInstalledExtensions = installedExtensions?.length > 0;
    if (hasInstalledExtensions) {
      if (walletData?.walletPairingString) {
        const { walletPairingString } = walletData;
        if (debug) console.log("Pairing String::", walletPairingString);
        hashconnect.connectToLocalWallet(walletPairingString);
      } else {
        if (debug) console.log("==== No Extension found in browser ====");
        return "wallet not installed";
      }
    }
  }, [installedExtensions, walletData, debug]);

  // prob dont need useCallback here
  const connectToBlade = useCallback(async () => {
    const bladeSigner = new BladeSigner();
    await bladeSigner.createSession();
    console.log("Account ID of Blade Signer:", bladeSigner.getAccountId().toString());
    dispatch({ type: ActionType.BLADE_WALLET_CONNECTED, bladeWallet: bladeSigner });
  }, [dispatch]);

  const clearWalletPairings = useCallback(() => {
    localStorage.removeItem("hashconnectData");
    dispatch({ type: ActionType.CLEAR_WALLET_PAIRINGS, field: "walletData" });
  }, [dispatch]);

  const getWalletBalance = useCallback(async () => {
    const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
    const walletBalance = await provider.getAccountBalance(walletData.pairedAccounts[0]);
    console.log(walletBalance.toJSON());
    const walletBalanceJSON = walletBalance.toJSON();
    dispatch({ type: ActionType.GET_WALLET_BALANCE, field: "walletData", payload: walletBalanceJSON });
  }, [network, walletData.topicID, walletData.pairedAccounts, dispatch]);

  const sendSwapTransaction = useCallback(
    async (
      depositTokenAccountId: string,
      depositTokenAmount: number,
      receivingTokenAccountId: string,
      receivingTokenAmount: number
    ) => {
      const SWAP_CONTRACT_ID = ContractId.fromString("0.0.47712695");
      const depositTokenAddress = TokenId.fromString(depositTokenAccountId).toSolidityAddress();
      // temporarily mocking address to strictly swap token A.
      const receivingTokenAddress = TokenId.fromString("0.0.47646100").toSolidityAddress();
      const tokenAQty = new BigNumber(depositTokenAmount);
      const tokenBQty = new BigNumber(receivingTokenAmount);

      console.log(selectedWalletName);
      const swapTransaction = new ContractExecuteTransaction().setContractId(SWAP_CONTRACT_ID).setGas(2000000);

      if (selectedWalletName === "HashPack") {
        const signingAccount = walletData.pairedAccounts[0];
        const walletAddress: string = AccountId.fromString(signingAccount).toSolidityAddress();
        const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
        const signer = hashconnect.getSigner(provider);

        const hashpackSwapTransaction = await swapTransaction
          .setFunction(
            "swapToken",
            new ContractFunctionParameters()
              .addAddress(walletAddress)
              .addAddress(depositTokenAddress) //token A
              .addAddress(receivingTokenAddress)
              .addInt64(tokenAQty)
              .addInt64(tokenBQty)
          )
          .setNodeAccountIds([new AccountId(3)])
          .freezeWithSigner(signer);

        const result = await hashpackSwapTransaction.executeWithSigner(signer);
        console.log(result.toString());
      } else {
        // annoying Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
        //          Type 'undefined' is not assignable to type 'string'.ts(2345)
        const bladeAccountAddress = bladeWallet?.getAccountId().toSolidityAddress() ?? "";
        const bladeSwapTransaction = swapTransaction
          .setFunction(
            "swapToken",
            new ContractFunctionParameters()
              .addAddress(bladeAccountAddress)
              .addAddress(depositTokenAddress) //token A
              .addAddress(receivingTokenAddress)
              .addInt64(tokenAQty)
              .addInt64(tokenBQty)
          )
          .setNodeAccountIds([new AccountId(3)]);
        const bladeResult = await bladeWallet?.call(bladeSwapTransaction);
        console.log(bladeResult?.toString());
      }
    },
    [network, walletData.topicID, walletData.pairedAccounts, selectedWalletName, bladeWallet]
  );

  useEffect(() => {
    establishWalletConnection();
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [hashConnectState, saveToLocalStorage]);

  useEffect(() => {
    if (debug) console.log(walletConnectionStatus);
    if (walletConnectionStatus === WalletConnectionStatus.PAIRED) {
      getWalletBalance();
    }
  }, [debug, walletConnectionStatus, getWalletBalance]);

  return {
    connectToWallet,
    connectToBlade,
    sendSwapTransaction,
    clearWalletPairings,
  };
};
export { useHashConnect };

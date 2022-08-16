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
import { ActionType, HashConnectAction } from "./actions/actionsTypes";
import {
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
} from "./actions/hashConnectActions";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { useHashConnectEvents } from "./useHashConnectEvents";
import { HASHCONNECT_LOCAL_DATA_KEY } from "./constants";
import { WalletConnectionStatus } from "./types";

/*
const dexMetadata: HashConnectTypes.AppMetadata = {
  name: "Hedera Open DEX",
  description: "An example hedera DEX",
  icon: "",
};
*/
const OPERATOR_ACCOUNT_ID = "0.0.47549759";
const OPERATOR_PUBLIC_KEY = "302a300506032b6570032100a1dcb686465f9f4c22baaff9e321f057e82b5081e1d110969e7d512157979ab8";
const OPERATOR_PRIVATE_KEY = Uint8Array.from(
  Buffer.from("302e020100300506032b657004220420ade33088ec47cd9d4ee4d9c9409567a4e39fddc2e4434aa6ace16e3278e253d5", "hex")
);

const operatorId = AccountId.fromString(OPERATOR_ACCOUNT_ID);
const operatorKey = PrivateKey.fromBytes(OPERATOR_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const hashconnect = new HashConnect(true);

export interface UseHashConnectProps {
  hashConnectState: HashConnectState;
  dispatch: Dispatch<HashConnectAction>;
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
  const { walletConnectionStatus, installedExtensions, walletData } = hashConnectState;
  useHashConnectEvents(hashconnect, hashConnectState, dispatch, debug);

  const saveToLocalStorage = useCallback(() => {
    const hashconnectDataJSON = JSON.stringify(hashConnectState);
    localStorage.setItem(HASHCONNECT_LOCAL_DATA_KEY, hashconnectDataJSON);
  }, [hashConnectState]);

  const clearWalletPairings = useCallback(() => {
    localStorage.removeItem("hashconnectData");
    dispatch({ type: ActionType.CLEAR_WALLET_PAIRINGS, field: "walletData" });
  }, [dispatch]);

  const sendSwapTransaction = useCallback(
    async (
      depositTokenAccountId: string,
      depositTokenAmount: number,
      receivingTokenAccountId: string,
      receivingTokenAmount: number
    ) => {
      const SWAP_CONTRACT_ID = ContractId.fromString("0.0.47712695");
      const signingAccount = walletData.pairedAccounts[0];
      const walletAddress: string = AccountId.fromString(signingAccount).toSolidityAddress();
      const depositTokenAddress = TokenId.fromString(depositTokenAccountId).toSolidityAddress();
      // temporarily mocking address to strictly swap token A.
      const receivingTokenAddress = TokenId.fromString("0.0.47646100").toSolidityAddress();
      const tokenAQty = new BigNumber(depositTokenAmount);
      const tokenBQty = new BigNumber(receivingTokenAmount);
      const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = hashconnect.getSigner(provider);

      const swapTransaction = await new ContractExecuteTransaction()
        .setContractId(SWAP_CONTRACT_ID)
        .setGas(2000000)
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

      const result = await swapTransaction.executeWithSigner(signer);
      console.log(result);
    },
    [network, walletData.topicID, walletData.pairedAccounts]
  );

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.INITIALIZING) {
      dispatch(
        initializeWalletConnection({
          hashconnect,
          network,
          dexMetaData,
          debug,
        })
      );
    } else {
      dispatch(pairWithConnectedWallet({ hashconnect, dexMetaData, hashConnectState }));
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [hashConnectState, saveToLocalStorage]);

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.PAIRED) {
      dispatch(fetchAccountBalance({ hashconnect, hashConnectState, network }));
    }
  }, [walletConnectionStatus]);

  return {
    connectToWallet: () =>
      dispatch(pairWithSelectedWalletExtension({ hashconnect, hashConnectState, installedExtensions })),
    sendSwapTransaction,
    clearWalletPairings,
  };
};
export { useHashConnect };

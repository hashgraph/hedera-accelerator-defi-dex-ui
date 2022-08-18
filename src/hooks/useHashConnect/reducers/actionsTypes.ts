import { AccountBalanceJson } from "@hashgraph/sdk";
import { HashConnectState } from "./hashConnectReducer";
import { MessageTypes } from "hashconnect";
import { ConnectionStatus } from "../types";
import { BladeSigner } from "@bladelabs/blade-web3.js";

export enum ActionType {
  INIT_WALLET_CONNECTION = "INIT_WALLET_CONNECTION",
  PAIR_WITH_WALLET = "PAIR_WITH_WALLET",
  CLEAR_WALLET_PAIRINGS = "CLEAR_WALLET_PAIRINGS",
  ADD_INSTALLED_EXTENSION = "ADD_INSTALLED_EXTENSION",
  WALLET_PAIRING_APPROVED = "WALLET_PAIRING_APPROVED",
  CONNECTION_STATUS_CHANGED = "CONNECTION_STATUS_CHANGED",
  GET_WALLET_BALANCE = "GET_WALLET_BALANCE",
  BLADE_WALLET_CONNECTED = "BLADE_WALLET_CONNECTED",
}

interface IInitWalletConnection {
  type: ActionType.INIT_WALLET_CONNECTION;
  field: "walletData";
  payload: Partial<HashConnectState>;
}

interface IClearWalletPairings {
  type: ActionType.CLEAR_WALLET_PAIRINGS;
  field: "walletData";
}

interface AddInstalledExtension {
  type: ActionType.ADD_INSTALLED_EXTENSION;
  payload: any;
}

interface WalletPairingApproved {
  type: ActionType.WALLET_PAIRING_APPROVED;
  field: "walletData";
  payload: MessageTypes.ApprovePairing;
}

interface ConnectionStatusChanged {
  type: ActionType.CONNECTION_STATUS_CHANGED;
  payload: ConnectionStatus;
}

interface GetWalletBalance {
  type: ActionType.GET_WALLET_BALANCE;
  field: "walletData";
  payload: AccountBalanceJson;
}

interface BladeWalletConnected {
  type: ActionType.BLADE_WALLET_CONNECTED;
  bladeWallet: BladeSigner;
}

export type HashConnectActions =
  | IInitWalletConnection
  | IClearWalletPairings
  | AddInstalledExtension
  | WalletPairingApproved
  | ConnectionStatusChanged
  | GetWalletBalance
  | BladeWalletConnected;

import { HashConnectState } from "./hashConnectReducer";
import { MessageTypes } from "hashconnect";
import { ConnectionStatus } from "./types";

export enum ActionType {
  INIT_WALLET_CONNECTION = "INIT_WALLET_CONNECTION",
  PAIR_WITH_WALLET = "PAIR_WITH_WALLET",
  CLEAR_WALLET_PAIRINGS = "CLEAR_WALLET_PAIRINGS",
  ADD_INSTALLED_EXTENSION = "ADD_INSTALLED_EXTENSION",
  WALLET_PAIRING_APPROVED = "WALLET_PAIRING_APPROVED",
  CONNECTION_STATUS_CHANGED = "CONNECTION_STATUS_CHANGED",
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

export type HashConnectActions =
  | IInitWalletConnection
  | IClearWalletPairings
  | AddInstalledExtension
  | WalletPairingApproved
  | ConnectionStatusChanged;

export type Networks = "testnet" | "mainnet" | "previewnet";

export type ConnectionStatus = "Paired" | "Connected" | "Connecting" | "Disconnected";

export enum WalletConnectionStatus {
  INITIALIZING = "Initializing",
  READY_TO_PAIR = "Ready To Pair",
  PAIRED = "Paired",
}

export type WalletConnectionStatusTypes = keyof typeof WalletConnectionStatus;

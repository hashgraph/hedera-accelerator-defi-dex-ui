export type Networks = "testnet" | "mainnet" | "previewnet";

export type ConnectionStatus = "Connected" | "Disconnected";

export enum WalletConnectionStatus {
  INITIALIZING = "Initializing",
  CONNECTED = "Connected",
  PAIRED = "Paired",
}

export type WalletConnectionStatusTypes = keyof typeof WalletConnectionStatus;

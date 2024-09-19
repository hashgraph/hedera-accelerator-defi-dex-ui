import { HashConnectConnectionState, SessionData } from "hashconnect/dist/types";

interface HashConnectEventHandlers {
  handlePairingEvent: (approvePairing: SessionData) => void;
  handleConnectionStatusChangeEvent: (connectionStatus: HashConnectConnectionState) => void;
}

export type { HashConnectEventHandlers };

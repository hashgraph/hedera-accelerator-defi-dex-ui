import { createContext, useRef } from "react";
import { createDEXStore, DEXStore } from "../store";
import { DappMetadata } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";

interface DEXProviderProps {
  children?: React.ReactNode;
  DEXMetaData: DappMetadata;
  network: LedgerId;
  debug: boolean;
}

const DexContext = createContext<DEXStore | null>(null);

const DEXStoreProvider = (props: DEXProviderProps) => {
  const { children, DEXMetaData, network, debug } = props;
  const initialContext = { DEXMetaData, network, debug };
  const dexStoreRef = useRef<DEXStore>();
  if (!dexStoreRef.current) {
    dexStoreRef.current = createDEXStore(initialContext);
  }
  return <DexContext.Provider value={dexStoreRef.current}>{children}</DexContext.Provider>;
};

export { DEXStoreProvider, DexContext };
export type { DEXProviderProps };

import { useContext } from "react";
import { useStore } from "zustand";
import { DexContext } from "../context";
import { DEXState } from "../store";

export function useDexContext<T>(selector: (state: DEXState) => T, equalityFn?: (left: T, right: T) => boolean): T {
  const store = useContext(DexContext);
  if (!store) throw new Error("Missing DexContext.Provider in the tree");
  return useStore(store, selector, equalityFn);
}

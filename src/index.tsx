import { enableMapSet } from "immer";
import { createRoot } from "react-dom/client";
import { DEX } from "@dex";
import { DAO } from "@dao";
import { DEXStoreProvider } from "@dex/context";
import { initializeServices } from "@dex/services";
import { DEFAULT_DEX_PROVIDER_PROPS } from "@dex/store";

/** Needed to enable immutable immer updates on Map and Set objects. */
enableMapSet();

initializeServices().then(() => {
  const container = document.getElementById("root") as HTMLElement;
  const root = createRoot(container);
  root.render(<DEXStoreProvider {...DEFAULT_DEX_PROVIDER_PROPS}>{<DAO />}</DEXStoreProvider>);
});

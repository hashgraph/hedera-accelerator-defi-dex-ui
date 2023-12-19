import { enableMapSet } from "immer";
import { createRoot } from "react-dom/client";
//import { DEX } from "@dex";
import { DAO } from "@dao";
import { DEXStoreProvider } from "@dex/context";
import { initializeServices } from "@dex/services";
import { DEFAULT_DEX_PROVIDER_PROPS } from "@dex/store";

//const DAO_HOSTNAME = "dao";
//const DEX_HOSTNAME = "defi-ui";
//const DEV_ENV = "development";
/**
 * `shouldRenderDEX = false` will render the DAO app.
 * `shouldRenderDEX = true` will render the DEX app.
 * TODO: Setup feature flag for running DAO or DEX app.
 * */
//const shouldRenderDEX = false;

/** Needed to enable immutable immer updates on Map and Set objects. */
enableMapSet();

initializeServices().then(() => {
  const container = document.getElementById("root") as HTMLElement;
  const root = createRoot(container);
  // const devHostname = shouldRenderDEX ? DEX_HOSTNAME : DAO_HOSTNAME;
  // const subdomain = process.env.NODE_ENV === DEV_ENV ? devHostname : window.location.hostname.split(".")?.[0];

  function getApp(): React.ReactNode {
    return <DAO />;
    /*
    if (subdomain.includes(DAO_HOSTNAME)) return <DAO />;
    if (subdomain.includes(DEX_HOSTNAME)) {
      return <DEX />;
    }
    // TODO: Style this error message component.
    return <>Cannot resolve hostname</>;
    */
  }

  root.render(<DEXStoreProvider {...DEFAULT_DEX_PROVIDER_PROPS}>{getApp()}</DEXStoreProvider>);
});

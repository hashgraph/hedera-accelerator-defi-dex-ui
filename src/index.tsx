import { enableMapSet } from "immer";
import { createRoot } from "react-dom/client";
import { DEX } from "@dex";
import { DAO } from "@dao";
import { DEXStoreProvider } from "@dex/context";
import { initializeServices } from "@dex/services";
import { DEFAULT_DEX_PROVIDER_PROPS } from "@dex/store";

const DAO_HOSTNAME = "dao";
const DEX_HOSTNAME = "defi-ui";

/** Needed to enable immutable immer updates on Map and Set objects. */
enableMapSet();

initializeServices().then(() => {
  const container = document.getElementById("root") as HTMLElement;
  const root = createRoot(container);

  // Use hostname to determine which app to render
  // For localhost development: dao.localhost:5173 or defi-ui.localhost:5173
  // For production: dao.yourdomain.com or defi-ui.yourdomain.com
  const hostname = window.location.hostname;

  function getApp(): React.ReactNode {
    if (hostname.includes(DAO_HOSTNAME)) return <DAO />;
    if (hostname.includes(DEX_HOSTNAME)) return <DEX />;

    // Default to DAO if accessing via localhost or IP without subdomain
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      console.log(
        "No subdomain detected, defaulting to DAO app. " +
          "Use dao.localhost:5173 or defi-ui.localhost:5173 to specify."
      );
      return <DAO />;
    }

    return <>Cannot resolve hostname: {hostname}. Please use dao.* or defi-ui.* subdomain.</>;
  }

  root.render(<DEXStoreProvider {...DEFAULT_DEX_PROVIDER_PROPS}>{getApp()}</DEXStoreProvider>);
});

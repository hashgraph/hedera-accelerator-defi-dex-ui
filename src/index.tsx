import React from "react";
import { createRoot } from "react-dom/client";
import { HederaOpenDEX } from "./HederaOpenDEX/HederaOpenDEX";
import { HashConnectProvider } from "./context";
import { HederaServiceProvider } from "./hooks/useHederaService/HederaServiceContext";


const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <HashConnectProvider debug>
    <HederaServiceProvider>
      <HederaOpenDEX />
    </HederaServiceProvider>
  </HashConnectProvider>
);

import React from "react";
import { createRoot } from "react-dom/client";
import { HederaOpenDEX } from "./HederaOpenDEX/HederaOpenDEX";
import { HashConnectProvider } from "./context";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <HashConnectProvider debug>
    <HederaOpenDEX />
  </HashConnectProvider>
);

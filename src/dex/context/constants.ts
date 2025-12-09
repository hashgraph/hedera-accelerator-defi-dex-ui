import { DappMetadata } from "hashconnect";

// Use the current window location as the URL to ensure WalletConnect works on any deployment
const getAppUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://hashiodao.netlify.app/";
};

export const DEFAULT_APP_METADATA: DappMetadata = {
  name: "HashioDao",
  description: "A Hedera based DAO and DEX platform",
  icons: [],
  url: getAppUrl(),
};

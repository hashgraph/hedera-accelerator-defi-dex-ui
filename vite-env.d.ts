/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_PINATA_GATEWAY_URL: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_PINATA_GATEWAY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

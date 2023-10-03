/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import aliases from "./aliases.paths.json";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dns from "dns";

const resolvedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [key, path.resolve(__dirname, value)])
);

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "setupTests.ts"],
    },
  },
  build: {
    outDir: "build",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: resolvedAliases,
  },
  server: {
    open: true,
    host: "localhost",
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
});

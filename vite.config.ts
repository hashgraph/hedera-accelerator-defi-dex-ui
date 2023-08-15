/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import aliases from "./aliases.paths.json";

const resolvedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [key, path.resolve(__dirname, value)])
);

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
  resolve: {
    alias: resolvedAliases,
  },
  plugins: [react()],
});

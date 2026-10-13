import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vite に postcss.config.mjs（Next 形式）を読ませない
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

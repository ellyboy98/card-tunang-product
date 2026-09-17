import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    // Mirror tsconfig's `@/*` alias without adding a plugin dependency.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});

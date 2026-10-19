import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
    fileParallelism: false,
    hookTimeout: 30_000,
    env: {
      REDIS_HOST: "localhost",
      REDIS_PORT: "6380",
      LOG_LEVEL: "silent",
    },
  },
});

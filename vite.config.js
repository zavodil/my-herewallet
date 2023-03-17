import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { resolve } from "path";

export default defineConfig({
  define: {
    "process.env": process.env,
    global: "globalThis",
  },
  optimizeDeps: {
    disabled: false,
  },
  build: {
    commonjsOptions: {
      include: [],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        connector: resolve(__dirname, "connector/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer/",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      path: "path-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
      util: "util",
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin({ exportAsDefault: true })],
});

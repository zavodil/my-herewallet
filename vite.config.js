import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgrPlugin from "vite-plugin-svgr";
import { resolve } from "path";

const isExport = process.env.BUILD_ID === "export";
const input = {};

if (isExport) {
  input.export = resolve(__dirname, "export/index.html");
} else {
  input.connector = resolve(__dirname, "connector/index.html");
  input.index = resolve(__dirname, "index.html");
}

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
      input,
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
  plugins: [
    pluginRewriteAll(),
    react(),
    viteTsconfigPaths(),
    svgrPlugin({ exportAsDefault: true }),
  ].concat(isExport ? [viteSingleFile()] : []),
});

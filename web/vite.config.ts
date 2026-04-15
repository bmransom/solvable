import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5188,
  },
  optimizeDeps: {
    exclude: ["solvable-wasm"],
  },
  build: {
    target: "esnext",
  },
  worker: {
    format: "es",
  },
});

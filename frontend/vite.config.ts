import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // The Threads Drawer wraps the `copilotkit-threads-drawer` web
          // component; let Vue pass any cpk-/copilotkit- tags through.
          isCustomElement: (tag) => tag.startsWith("copilotkit-") || tag.startsWith("cpk-"),
        },
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // One .env at the repo root; only VITE_* variables reach the browser.
  envDir: "..",
  server: {
    port: 5173,
    // The notes pages display backend source files (lib/source.ts).
    fs: { allow: [".."] },
  },
});

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Puzzle Pal",
        short_name: "PuzzlePal",
        theme_color: "#ffffff",
      },
      pwaAssets: {
        image: "src/Semaphore_Papa.svg",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});

export default config;

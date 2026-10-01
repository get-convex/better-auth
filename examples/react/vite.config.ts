import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    conditions: ["@convex-dev/component-source", ...defaultClientConditions],
    dedupe: ["react", "react-dom"],
  },
});

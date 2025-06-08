// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
console.log("env", import.meta.env.VITE_SITE_URL);
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ]
  },
  server: {
    routeRules: {
      "/api/auth/**": {
        proxy: {
          to: "https://reminiscent-manatee-868.convex.site/api/auth/**"
        }
      }
    }
  }
});
export {
  app_config_default as default
};

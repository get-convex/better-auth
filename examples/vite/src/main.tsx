import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProviderWithBetterAuth } from "@convex-dev/better-auth/react";
import { authClient } from "@/auth-client";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
  {
    verbose: false,
  }
);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProviderWithBetterAuth client={convex} authClient={authClient}>
      <App />
    </ConvexProviderWithBetterAuth>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";
import { useBetterAuth } from "@/auth.ts";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
  {
    verbose: false,
  },
);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
);

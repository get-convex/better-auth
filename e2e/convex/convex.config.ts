import { defineApp } from "convex/server";
import oauthProvider from "./betterAuth/convex.config";

const app = defineApp();
app.use(oauthProvider, { name: "oauthProvider" });
export default app;

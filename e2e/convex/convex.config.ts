import { defineApp } from "convex/server";
import oauthProvider from "./betterAuth/convex.config";

const app = defineApp();
// Keep provider fixtures separate from the bundled component used by the React tests.
app.use(oauthProvider, { name: "oauthProvider" });
export default app;

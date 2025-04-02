// This file re-exports the auth config for schema generation
import { Adapter } from "better-auth";
import { auth } from "./src/client/auth";

// Generate schema for drizzle, closest syntax to Convex schema
// AI can translate schema changes to Convex schema, just requires
// review for accuracy
const config = auth(() => ({ id: "drizzle" }) as Adapter, {});
export { config as auth };

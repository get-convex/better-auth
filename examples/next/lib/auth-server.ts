import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { cache } from "react";

const { handler, getToken } = convexBetterAuthNextJs();
const cachedGetToken = cache(getToken);

export { handler, cachedGetToken as getToken };

import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { GenericActionCtx } from "convex/server";

export const getToken = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie("convex_jwt");
  const token = cookieStore.get(cookie.name);
  return typeof token === "string" ? token : token?.value;
};

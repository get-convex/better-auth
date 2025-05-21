import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { GenericActionCtx } from "convex/server";

export const getToken = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
  cookies?: Partial<{ [key: string]: string }>
) => {
  const { cookies: nextCookies } = await import("next/headers");
  const cookieStore = cookies
    ? new Map(Object.entries(cookies))
    : await nextCookies();
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie("convex_jwt");
  const token = cookieStore.get(cookie.name);
  return typeof token === "string" ? token : token?.value;
};

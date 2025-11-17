import { clientOptions } from "@/lib/auth-client";
import { createAuthClient } from "better-auth/client";
import { headers } from "next/headers";

export const serverAuthClient = createAuthClient({
  ...clientOptions,
  baseURL: process.env.SITE_URL,
});

export const getToken = async () => {
  console.log("getToken from server");
  const { data } = await serverAuthClient.convex.token({
    fetchOptions: {
      headers: await headers(),
    },
  });
  return data?.token;
};

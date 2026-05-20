import { describe, expect, it, vi } from "vitest";
import { httpRouter } from "convex/server";
import { createClient } from "./create-client.js";

const component = {
  adapter: {
    create: "create",
    findOne: "findOne",
    findMany: "findMany",
    updateOne: "updateOne",
    updateMany: "updateMany",
    deleteOne: "deleteOne",
    deleteMany: "deleteMany",
  },
} as any;

const getRouteHandler = (
  http: ReturnType<typeof httpRouter>,
  path: string,
  method: "GET" | "POST" | "OPTIONS"
) => {
  const route = http.lookup(path, method);
  if (!route) {
    return null;
  }
  return route[0] as unknown as {
    _handler: (ctx: unknown, request: Request) => Promise<Response>;
  };
};

describe("createClient route registration", () => {
  it("registerRoutes eagerly initializes auth and infers basePath", () => {
    const client = createClient(component);
    const http = httpRouter();
    const createAuth = vi.fn(() => ({
      handler: async () => new Response("ok"),
      options: {
        basePath: "/custom/auth",
        trustedOrigins: ["https://app.example.com"],
      },
      $context: Promise.resolve({
        options: {
          trustedOrigins: ["https://app.example.com"],
        },
      }),
    }));

    client.registerRoutes(http, createAuth);

    expect(createAuth).toHaveBeenCalledTimes(1);
    expect(getRouteHandler(http, "/custom/auth/test", "GET")).toBeTruthy();
    expect(
      getRouteHandler(http, "/.well-known/openid-configuration", "GET")
    ).toBeTruthy();
    expect(
      getRouteHandler(
        http,
        "/.well-known/openid-configuration/custom/auth",
        "GET"
      )
    ).toBeTruthy();
    expect(
      getRouteHandler(http, "/.well-known/oauth-authorization-server", "GET")
    ).toBeTruthy();
    expect(
      getRouteHandler(
        http,
        "/.well-known/oauth-authorization-server/custom/auth",
        "GET"
      )
    ).toBeTruthy();
    expect(
      getRouteHandler(http, "/.well-known/oauth-protected-resource", "GET")
    ).toBeTruthy();
  });

  it("registerRoutes uses auth options for CORS and basePath", async () => {
    const client = createClient(component);
    const http = httpRouter();
    const createAuth = vi.fn(() => ({
      handler: async () => new Response("ok"),
      options: {
        basePath: "/custom/auth",
        trustedOrigins: ["https://app.example.com"],
      },
      $context: Promise.resolve({
        options: {
          trustedOrigins: ["https://app.example.com"],
        },
      }),
    }));

    client.registerRoutes(http, createAuth, { cors: true });

    expect(createAuth).toHaveBeenCalledTimes(1);
    expect(getRouteHandler(http, "/custom/auth/test", "GET")).toBeTruthy();
    expect(getRouteHandler(http, "/custom/auth/test", "OPTIONS")).toBeTruthy();

    const optionsHandler = getRouteHandler(
      http,
      "/custom/auth/test",
      "OPTIONS"
    );
    expect(optionsHandler).toBeTruthy();
    const response = await optionsHandler!._handler(
      {},
      new Request("https://deployment.convex.site/custom/auth/test", {
        method: "OPTIONS",
        headers: {
          origin: "https://app.example.com",
          "access-control-request-method": "GET",
        },
      })
    );

    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://app.example.com"
    );
    expect(createAuth).toHaveBeenCalledTimes(1);

    const getHandler = getRouteHandler(http, "/custom/auth/test", "GET");
    expect(getHandler).toBeTruthy();
    const getResponse = await getHandler!._handler(
      {},
      new Request("https://deployment.convex.site/custom/auth/test", {
        method: "GET",
        headers: {
          origin: "https://app.example.com",
        },
      })
    );
    expect(getResponse.headers.get("access-control-expose-headers")).toContain(
      "WWW-Authenticate"
    );
    expect(createAuth).toHaveBeenCalledTimes(2);
  });

  it("registerRoutes exposes OAuth protected resource metadata", async () => {
    const originalConvexSiteUrl = process.env.CONVEX_SITE_URL;
    process.env.CONVEX_SITE_URL = "https://deployment.convex.site";
    try {
      const client = createClient(component);
      const http = httpRouter();
      const createAuth = vi.fn(() => ({
        handler: async () => new Response("ok"),
        options: {
          basePath: "/custom/auth",
          trustedOrigins: ["https://app.example.com"],
        },
        $context: Promise.resolve({
          options: {
            trustedOrigins: ["https://app.example.com"],
          },
        }),
      }));

      client.registerRoutes(http, createAuth);

      const handler = getRouteHandler(
        http,
        "/.well-known/oauth-protected-resource/custom/auth",
        "GET"
      );
      expect(handler).toBeTruthy();
      const response = await handler!._handler(
        {},
        new Request(
          "https://deployment.convex.site/.well-known/oauth-protected-resource/custom/auth"
        )
      );

      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );
      await expect(response.json()).resolves.toMatchObject({
        resource: "https://deployment.convex.site/custom/auth",
        authorization_servers: ["https://deployment.convex.site"],
        bearer_methods_supported: ["header"],
      });

      const mcpHandler = getRouteHandler(
        http,
        "/.well-known/oauth-protected-resource/mcp",
        "GET"
      );
      expect(mcpHandler).toBeTruthy();
      const mcpResponse = await mcpHandler!._handler(
        {},
        new Request(
          "https://deployment.convex.site/.well-known/oauth-protected-resource/mcp"
        )
      );

      expect(mcpResponse.headers.get("content-type")).toContain(
        "application/json"
      );
      await expect(mcpResponse.json()).resolves.toMatchObject({
        resource: "https://deployment.convex.site/mcp",
        authorization_servers: ["https://deployment.convex.site"],
        bearer_methods_supported: ["header"],
      });
    } finally {
      if (originalConvexSiteUrl === undefined) {
        delete process.env.CONVEX_SITE_URL;
      } else {
        process.env.CONVEX_SITE_URL = originalConvexSiteUrl;
      }
    }
  });

  it("restores preserved forwarded host headers before calling auth.handler", async () => {
    const client = createClient(component);
    const http = httpRouter();
    const handler = vi.fn(async (_request: Request) => new Response("ok"));
    const createAuth = vi.fn(() => ({
      handler,
      options: {
        trustedOrigins: ["https://app.example.com"],
      },
      $context: Promise.resolve({
        options: {
          trustedOrigins: ["https://app.example.com"],
        },
      }),
    }));

    client.registerRoutes(http, createAuth);

    const getHandler = getRouteHandler(http, "/api/auth/test", "GET");
    expect(getHandler).toBeTruthy();
    await getHandler!._handler(
      {},
      new Request("https://adjective-animal-123.convex.site/api/auth/test", {
        method: "GET",
        headers: {
          host: "deployment.convex.site",
          "x-forwarded-host": "deployment.convex.site",
          "x-forwarded-proto": "https",
          "x-better-auth-forwarded-host": "app.example.com",
          "x-better-auth-forwarded-proto": "https",
        },
      })
    );

    const forwardedRequest = handler.mock.calls[0]?.[0];
    expect(forwardedRequest).toBeInstanceOf(Request);
    expect(forwardedRequest.headers.get("x-forwarded-host")).toBe(
      "app.example.com"
    );
    expect(forwardedRequest.headers.get("x-forwarded-proto")).toBe("https");
  });

  it("registerRoutesLazy resolves trustedOrigins lazily when needed", async () => {
    const client = createClient(component);
    const http = httpRouter();
    const createAuth = vi.fn(() => ({
      handler: async () => new Response("ok"),
      options: {
        trustedOrigins: ["https://fallback.example.com"],
      },
      $context: Promise.resolve({
        options: {
          trustedOrigins: ["https://fallback.example.com"],
        },
      }),
    }));

    client.registerRoutesLazy(http, createAuth, {
      basePath: "/api/auth",
      cors: true,
    });
    expect(createAuth).not.toHaveBeenCalled();
    expect(getRouteHandler(http, "/api/auth/test", "GET")).toBeTruthy();

    const optionsHandler = getRouteHandler(http, "/api/auth/test", "OPTIONS");
    expect(optionsHandler).toBeTruthy();
    const response = await optionsHandler!._handler(
      {},
      new Request("https://deployment.convex.site/api/auth/test", {
        method: "OPTIONS",
        headers: {
          origin: "https://fallback.example.com",
          "access-control-request-method": "GET",
        },
      })
    );

    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://fallback.example.com"
    );
    expect(createAuth).toHaveBeenCalledTimes(1);
  });

  it("registerRoutesLazy infers basePath from auth options", () => {
    const client = createClient(component);
    const http = httpRouter();
    const createAuth = vi.fn(() => ({
      handler: async () => new Response("ok"),
      options: {
        basePath: "/custom/auth",
      },
      $context: Promise.resolve({
        options: {
          trustedOrigins: ["https://app.example.com"],
        },
      }),
    }));

    client.registerRoutesLazy(http, createAuth);

    expect(createAuth).toHaveBeenCalledTimes(1);
    expect(getRouteHandler(http, "/custom/auth/test", "GET")).toBeTruthy();
    expect(
      getRouteHandler(
        http,
        "/.well-known/oauth-authorization-server/custom/auth",
        "GET"
      )
    ).toBeTruthy();
  });

  it("fails fast when CONVEX_SITE_URL is missing for protected resource metadata", async () => {
    const previousSiteUrl = process.env.CONVEX_SITE_URL;
    delete process.env.CONVEX_SITE_URL;

    try {
      const client = createClient(component);
      const http = httpRouter();
      const createAuth = vi.fn(() => ({
        handler: async () => new Response("ok"),
        options: {
          basePath: "/custom/auth",
        },
        $context: Promise.resolve({
          options: {
            trustedOrigins: ["https://app.example.com"],
          },
        }),
      }));

      client.registerRoutes(http, createAuth);

      const handler = getRouteHandler(
        http,
        "/.well-known/oauth-protected-resource/custom/auth",
        "GET"
      );
      expect(handler).toBeTruthy();

      await expect(
        handler!._handler(
          {},
          new Request(
            "https://deployment.convex.site/.well-known/oauth-protected-resource/custom/auth"
          )
        )
      ).rejects.toThrow("CONVEX_SITE_URL is not set");
    } finally {
      if (previousSiteUrl === undefined) {
        delete process.env.CONVEX_SITE_URL;
      } else {
        process.env.CONVEX_SITE_URL = previousSiteUrl;
      }
    }
  });
});

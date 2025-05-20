/**
 * This file defines a CorsHttpRouter class that extends Convex's HttpRouter.
 * It provides CORS (Cross-Origin Resource Sharing) support for HTTP routes.
 *
 * The CorsHttpRouter:
 * 1. Allows specifying allowed origins for CORS.
 * 2. Overrides the route method to add CORS headers to all non-OPTIONS requests.
 * 3. Automatically adds an OPTIONS route to handle CORS preflight requests.
 * 4. Uses the handleCors helper function to apply CORS headers consistently.
 *
 * This router simplifies the process of making Convex HTTP endpoints
 * accessible to web applications hosted on different domains while
 * maintaining proper CORS configuration.
 */
import {
  GenericActionCtx,
  httpActionGeneric,
  httpRouter,
  HttpRouter,
  PublicHttpAction,
  RouteSpec,
  RouteSpecWithPath,
  RouteSpecWithPathPrefix,
} from "convex/server";

export const DEFAULT_EXPOSED_HEADERS = [
  // For Range requests
  "Content-Range",
  "Accept-Ranges",
];

export type CorsConfig = {
  /**
   * Whether to allow credentials in the request.
   * When true, the request can include cookies and authentication headers.
   * @default false
   */
  allowCredentials?: boolean;
  /**
   * An array of allowed origins: what domains are allowed to make requests.
   * For example, ["https://example.com"] would only allow requests from
   * https://example.com.
   * You can also use wildcards to allow all subdomains of a given domain.
   * E.g. ["*.example.com"] would allow requests from:
   * - https://subdomain.example.com
   * - https://example.com
   * @default ["*"]
   */
  allowedOrigins?: string[];
  /**
   * An array of allowed headers: what headers are allowed to be sent in
   * the request.
   * @default ["Content-Type"]
   */
  allowedHeaders?: string[];
  /**
   * An array of exposed headers: what headers are allowed to be sent in
   * the response.
   * Note: if you pass in an empty array, it will not expose any headers.
   * If you want to extend the default exposed headers, you can do so by
   * passing in [...DEFAULT_EXPOSED_HEADERS, ...yourHeaders].
   * @default {@link DEFAULT_EXPOSED_HEADERS}
   */
  exposedHeaders?: string[];
  /**
   * The maximum age of the preflight request in seconds.
   * @default 86400 (1 day)
   */
  browserCacheMaxAge?: number;
  /**
   * Whether to log verbose information about CORS requests.
   * @default false
   */
  verbose?: boolean;
};

type RouteSpecWithCors = RouteSpec & CorsConfig;

/**
 * Factory function to create a router that adds CORS support to routes.
 * @param allowedOrigins An array of allowed origins for CORS.
 * @returns A function to use instead of http.route when you want CORS.
 */
export const corsRouter = (http: HttpRouter, corsConfig?: CorsConfig) => {
  const allowedExactMethodsByPath: Map<string, Set<string>> = new Map();
  const allowedPrefixMethodsByPath: Map<string, Set<string>> = new Map();
  return {
    http,
    route: (routeSpec: RouteSpecWithCors): void => {
      const tempRouter = httpRouter();
      tempRouter.exactRoutes = http.exactRoutes;
      tempRouter.prefixRoutes = http.prefixRoutes;

      const config = {
        ...corsConfig,
        ...routeSpec,
      };

      const httpCorsHandler = handleCors({
        originalHandler: routeSpec.handler,
        allowedMethods: [routeSpec.method],
        ...config,
      });
      /**
       * Figure out what kind of route we're adding: exact or prefix and handle
       * accordingly.
       */
      if ("path" in routeSpec) {
        let methods = allowedExactMethodsByPath.get(routeSpec.path);
        if (!methods) {
          methods = new Set<string>();
          allowedExactMethodsByPath.set(routeSpec.path, methods);
        }
        methods.add(routeSpec.method);
        tempRouter.route({
          path: routeSpec.path,
          method: routeSpec.method,
          handler: httpCorsHandler,
        });
        handleExactRoute(tempRouter, routeSpec, config, Array.from(methods));
      } else {
        let methods = allowedPrefixMethodsByPath.get(routeSpec.pathPrefix);
        if (!methods) {
          methods = new Set<string>();
          allowedPrefixMethodsByPath.set(routeSpec.pathPrefix, methods);
        }
        methods.add(routeSpec.method);
        tempRouter.route({
          pathPrefix: routeSpec.pathPrefix,
          method: routeSpec.method,
          handler: httpCorsHandler,
        });
        handlePrefixRoute(tempRouter, routeSpec, config, Array.from(methods));
      }

      /**
       * Copy the routes from the temporary router to the main router.
       */
      http.exactRoutes = new Map(tempRouter.exactRoutes);
      http.prefixRoutes = new Map(tempRouter.prefixRoutes);
    },
  };
};

/**
 * Handles exact route matching and adds OPTIONS handler.
 * @param tempRouter Temporary router instance.
 * @param routeSpec Route specification for exact matching.
 */
function handleExactRoute(
  tempRouter: HttpRouter,
  routeSpec: RouteSpecWithPath,
  config: CorsConfig,
  allowedMethods: string[]
): void {
  const currentMethodsForPath = tempRouter.exactRoutes.get(routeSpec.path);
  /**
   * Add the OPTIONS handler for the given path
   */
  const optionsHandler = createOptionsHandlerForMethods(allowedMethods, config);
  currentMethodsForPath?.set("OPTIONS", optionsHandler);
  tempRouter.exactRoutes.set(routeSpec.path, new Map(currentMethodsForPath));
}

/**
 * Handles prefix route matching and adds OPTIONS handler.
 * @param tempRouter Temporary router instance.
 * @param routeSpec Route specification for prefix matching.
 */
function handlePrefixRoute(
  tempRouter: HttpRouter,
  routeSpec: RouteSpecWithPathPrefix,
  config: CorsConfig,
  allowedMethods: string[]
): void {
  /**
   * prefixRoutes is structured differently than exactRoutes. It's defined as
   * a Map<string, Map<string, PublicHttpAction>> where the KEY is the
   * METHOD and the VALUE is a map of paths and handlers.
   */
  const optionsHandler = createOptionsHandlerForMethods(allowedMethods, config);

  const optionsPrefixes =
    tempRouter.prefixRoutes.get("OPTIONS") ||
    new Map<string, PublicHttpAction>();
  optionsPrefixes.set(routeSpec.pathPrefix, optionsHandler);

  tempRouter.prefixRoutes.set("OPTIONS", optionsPrefixes);
}

/**
 * Creates an OPTIONS handler for the given HTTP methods.
 * @param methods Array of HTTP methods to be allowed.
 * @returns A CORS-enabled OPTIONS handler.
 */
function createOptionsHandlerForMethods(
  methods: string[],
  config: CorsConfig
): PublicHttpAction {
  return handleCors({
    ...config,
    allowedMethods: methods,
  });
}

export default corsRouter;

/**
 * handleCors() is a higher-order function that wraps a Convex HTTP action handler to add CORS support.
 * It allows for customization of allowed HTTP methods and origins for cross-origin requests.
 *
 * The function:
 * 1. Validates and normalizes the allowed HTTP methods.
 * 2. Generates appropriate CORS headers based on the provided configuration.
 * 3. Handles preflight OPTIONS requests automatically.
 * 4. Wraps the original handler to add CORS headers to its response.
 *
 * This helper simplifies the process of making Convex HTTP actions accessible
 * to web applications hosted on different domains.
 */

import { ROUTABLE_HTTP_METHODS, RoutableMethod } from "convex/server";

const SECONDS_IN_A_DAY = 60 * 60 * 24;

/**
 * Example CORS origins:
 * - "*" (allow all origins)
 * - "https://example.com" (allow a specific domain)
 * - "https://*.example.com" (allow all subdomains of example.com)
 * - "https://example1.com, https://example2.com" (allow multiple specific domains)
 * - "null" (allow requests from data URLs or local files)
 */

const handleCors = ({
  originalHandler,
  allowedMethods = ["OPTIONS"],
  allowedOrigins = ["*"],
  allowedHeaders = ["Content-Type"],
  exposedHeaders = DEFAULT_EXPOSED_HEADERS,
  allowCredentials = false,
  browserCacheMaxAge = SECONDS_IN_A_DAY,
  verbose = false,
}: {
  originalHandler?: PublicHttpAction;
  allowedMethods?: string[];
} & CorsConfig) => {
  const uniqueMethods = Array.from(
    new Set(
      allowedMethods.map((method) => method.toUpperCase() as RoutableMethod)
    )
  );
  const filteredMethods = uniqueMethods.filter((method) =>
    ROUTABLE_HTTP_METHODS.includes(method)
  );

  if (filteredMethods.length === 0) {
    throw new Error("No valid HTTP methods provided");
  }

  /**
   * Ensure OPTIONS is not duplicated if it was passed in
   * E.g. if allowedMethods = ["GET", "OPTIONS"]
   */
  const allowMethods = filteredMethods.includes("OPTIONS")
    ? filteredMethods.join(", ")
    : [...filteredMethods].join(", ");

  /**
   * Build up the set of CORS headers
   */
  const commonHeaders: Record<string, string> = {
    Vary: "Origin",
  };
  if (allowCredentials) {
    commonHeaders["Access-Control-Allow-Credentials"] = "true";
  }
  if (exposedHeaders.length > 0) {
    commonHeaders["Access-Control-Expose-Headers"] = exposedHeaders.join(", ");
  }

  // Helper function to check if origin is allowed (including wildcard subdomain matching)
  function isAllowedOrigin(requestOrigin: string): boolean {
    return allowedOrigins.some((allowed) => {
      if (allowed === "*") return true;
      if (allowed === requestOrigin) return true;
      if (allowed.startsWith("*.")) {
        const wildcardDomain = allowed.slice(1); // ".bar.com"
        const rootDomain = allowed.slice(2); // "bar.com"
        try {
          const url = new URL(requestOrigin);
          return (
            url.protocol === "https:" &&
            (url.hostname.endsWith(wildcardDomain) ||
              url.hostname === rootDomain)
          );
        } catch {
          return false; // Invalid URL format
        }
      }
      return false;
    });
  }

  /**
   * Return our modified HTTP action
   */
  return httpActionGeneric(
    async (ctx: GenericActionCtx<any>, request: Request) => {
      if (verbose) {
        console.log("path", request.url);
        console.log("origin", request.headers.get("origin"));
        console.log("headers", request.headers);
      }
      const requestOrigin =
        request.headers.get("Origin") ?? request.headers.get("Expo-Origin");

      // Handle origin matching
      let allowOrigins: string | null = null;
      if (allowedOrigins.includes("*") && !allowCredentials) {
        allowOrigins = "*";
      } else if (requestOrigin) {
        // Check if the request origin matches any of the allowed origins
        // (including wildcard subdomain matching if configured)
        if (isAllowedOrigin(requestOrigin)) {
          allowOrigins = requestOrigin;
        }
      }

      if (!allowOrigins) {
        // Origin not allowed
        return new Response(null, { status: 403 });
      }
      /**
       * OPTIONS has no handler and just returns headers
       */
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: new Headers({
            ...commonHeaders,
            "Access-Control-Allow-Origin": allowOrigins,
            "Access-Control-Allow-Methods": allowMethods,
            "Access-Control-Allow-Headers": allowedHeaders.join(", "),
            "Access-Control-Max-Age": browserCacheMaxAge.toString(),
          }),
        });
      }

      /**
       * If the method is not OPTIONS, it must pass a handler
       */
      if (!originalHandler) {
        throw new Error("No PublicHttpAction provider to CORS handler");
      }

      /**
       * First, execute the original handler
       */
      const innerHandler = ("_handler" in originalHandler
        ? (originalHandler["_handler"] as PublicHttpAction)
        : originalHandler) as unknown as (
        ctx: GenericActionCtx<any>,
        request: Request
      ) => Promise<Response>;
      const originalResponse = await innerHandler(ctx, request);

      /**
       * Second, get a copy of the original response's headers
       */
      const newHeaders = new Headers(originalResponse.headers);
      newHeaders.set("Access-Control-Allow-Origin", allowOrigins);

      /**
       * Third, add or update our CORS headers
       */
      Object.entries(commonHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      /**
       * Fourth, return the modified Response.
       * A Response object is immutable, so we create a new one to return here.
       */
      return new Response(originalResponse.body, {
        status: originalResponse.status,
        statusText: originalResponse.statusText,
        headers: newHeaders,
      });
    }
  );
};

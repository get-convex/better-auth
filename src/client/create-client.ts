import {
  httpActionGeneric,
  internalMutationGeneric,
  queryGeneric,
} from "convex/server";
import type {
  DataModelFromSchemaDefinition,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericSchema,
  HttpRouter,
  SchemaDefinition,
} from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Infer } from "convex/values";
import type { BetterAuthOptions } from "better-auth/minimal";
import { convexAdapter } from "./adapter.js";
import { corsRouter } from "convex-helpers/server/cors";
import type defaultSchema from "../component/schema.js";
import type { ComponentApi } from "../component/_generated/component.js";
import type { CreateAuth, GenericCtx } from "./index.js";
import type { TrustedOriginsOption } from "../utils/index.js";

export type AuthFunctions = {
  onCreate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onUpdate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onDelete?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
};

export type Triggers<
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<any, any>,
> = {
  [K in keyof Schema["tables"]]?: {
    onCreate?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      doc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
    onUpdate?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      newDoc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      },
      oldDoc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
    onDelete?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      doc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
  };
};

type SlimComponentApi = {
  adapter: {
    create: FunctionReference<"mutation", "internal">;
    findOne: FunctionReference<"query", "internal">;
    findMany: FunctionReference<"query", "internal">;
    updateOne: FunctionReference<"mutation", "internal">;
    updateMany: FunctionReference<"mutation", "internal">;
    deleteOne: FunctionReference<"mutation", "internal">;
    deleteMany: FunctionReference<"mutation", "internal">;
  };
  adapterTest?: ComponentApi["adapterTest"];
};

type RouteCorsOptions =
  | boolean
  | {
      allowedOrigins?: string[];
      allowedHeaders?: string[];
      exposedHeaders?: string[];
    };

type RegisterRoutesOptions = {
  basePath?: string;
  trustedOrigins?: TrustedOriginsOption;
  cors?: RouteCorsOptions;
};

type RouteInfoOptions = Pick<
  BetterAuthOptions,
  "basePath" | "baseURL" | "trustedOrigins"
>;

type RouteInfoFactory<DataModel extends GenericDataModel> = (
  ctx: GenericCtx<DataModel>
) => RouteInfoOptions;

type RegisterRoutesLazyOptions<DataModel extends GenericDataModel> =
  RegisterRoutesOptions & {
    options?: RouteInfoOptions | RouteInfoFactory<DataModel>;
  };

const isDynamicBaseURLConfig = (
  baseURL: BetterAuthOptions["baseURL"]
): baseURL is {
  allowedHosts: string[];
  fallback?: string;
} => {
  return (
    typeof baseURL === "object" &&
    baseURL !== null &&
    "allowedHosts" in baseURL &&
    Array.isArray(baseURL.allowedHosts)
  );
};

const getOrigin = (url: string) => {
  try {
    const origin = new URL(url).origin;
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
};

const getEnvTrustedOrigins = () => {
  return process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [];
};

const getTrustedOriginsFromOptions = (
  options?: RouteInfoOptions
): TrustedOriginsOption | undefined => {
  const staticOrigins: (string | null | undefined)[] = getEnvTrustedOrigins();

  if (isDynamicBaseURLConfig(options?.baseURL)) {
    for (const host of options.baseURL.allowedHosts) {
      if (!host.includes("://")) {
        staticOrigins.push(`https://${host}`);
        if (host.includes("localhost") || host.includes("127.0.0.1")) {
          staticOrigins.push(`http://${host}`);
        }
        continue;
      }
      staticOrigins.push(host);
    }

    if (options.baseURL.fallback) {
      staticOrigins.push(getOrigin(options.baseURL.fallback));
    }
  } else if (typeof options?.baseURL === "string") {
    staticOrigins.push(getOrigin(options.baseURL));
  }

  if (Array.isArray(options?.trustedOrigins)) {
    staticOrigins.push(...options.trustedOrigins);
  }

  const normalizedStaticOrigins = staticOrigins.filter(
    (origin): origin is string =>
      typeof origin === "string" && origin.length > 0
  );

  if (typeof options?.trustedOrigins === "function") {
    const dynamicTrustedOrigins = options.trustedOrigins;
    return async (request?: Request) => {
      const dynamicOrigins = await dynamicTrustedOrigins(request);
      const normalizedDynamicOrigins = dynamicOrigins.filter(
        (origin): origin is string =>
          typeof origin === "string" && origin.length > 0
      );
      return normalizedStaticOrigins.concat(normalizedDynamicOrigins);
    };
  }

  return normalizedStaticOrigins.length > 0
    ? normalizedStaticOrigins
    : undefined;
};

const resolveRouteInfoOptions = <DataModel extends GenericDataModel>(
  options?: RouteInfoOptions | RouteInfoFactory<DataModel>
) => {
  if (!options) {
    return undefined;
  }

  if (typeof options === "function") {
    try {
      return options({} as any);
    } catch {
      throw new Error(
        "Could not infer Better Auth route options for registerRoutesLazy(). Pass explicit basePath/trustedOrigins, or ensure the options factory can run without a live Convex context."
      );
    }
  }

  return options;
};

/**
 * Backend API for the Better Auth component.
 * Responsible for exposing the `client` and `triggers` APIs to the client, http
 * route registration, and having convenience methods for interacting with the
 * component from the backend.
 *
 * @param component - Generally `components.betterAuth` from
 * `./_generated/api` once you've configured it in `convex.config.ts`.
 * @param config - Configuration options for the component.
 * @param config.local - Local schema configuration.
 * @param config.verbose - Whether to enable verbose logging.
 * @param config.triggers - Triggers configuration.
 * @param config.authFunctions - Authentication functions configuration.
 */
export const createClient = <
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<GenericSchema, true> = typeof defaultSchema,
  Api extends SlimComponentApi = SlimComponentApi,
>(
  component: Api,
  config?: {
    local?: {
      schema?: Schema;
    };
    verbose?: boolean;
  } & (
    | {
        triggers: Triggers<DataModel, Schema>;
        authFunctions: AuthFunctions;
      }
    | { triggers?: undefined }
  )
) => {
  type BetterAuthDataModel = DataModelFromSchemaDefinition<Schema>;

  const safeGetAuthUser = async (ctx: GenericCtx<DataModel>) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }
    const session = (await ctx.runQuery(component.adapter.findOne, {
      model: "session",
      where: [
        {
          field: "_id",
          value: identity.sessionId as string,
        },
        {
          field: "expiresAt",
          operator: "gt",
          value: new Date().getTime(),
        },
      ],
    })) as BetterAuthDataModel["session"]["document"] | null;

    if (!session) {
      return;
    }

    const doc = (await ctx.runQuery(component.adapter.findOne, {
      model: "user",
      where: [
        {
          field: "_id",
          value: identity.subject,
        },
      ],
    })) as BetterAuthDataModel["user"]["document"] | null;
    if (!doc) {
      return;
    }
    return doc;
  };

  const getAuthUser = async (ctx: GenericCtx<DataModel>) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthenticated");
    }
    return user;
  };

  const getHeaders = async (ctx: GenericCtx<DataModel>) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Headers();
    }
    // Don't validate the session here, let Better Auth handle that
    const session = await ctx.runQuery(component.adapter.findOne, {
      model: "session",
      where: [
        {
          field: "_id",
          value: identity.sessionId as string,
        },
      ],
    });
    return new Headers({
      ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
      ...(session?.ipAddress
        ? { "x-forwarded-for": session.ipAddress as string }
        : {}),
    });
  };

  const registerRoutesImpl = <T extends CreateAuth<DataModel>>(
    http: HttpRouter,
    createAuth: T,
    opts: RegisterRoutesOptions,
    routeConfig: {
      path: string;
      trustedOrigins?: TrustedOriginsOption;
      getRegistrationAuth?: () => ReturnType<CreateAuth<DataModel>>;
    }
  ) => {
    let registrationAuth: ReturnType<CreateAuth<DataModel>> | undefined;
    const getRegistrationAuth = (): ReturnType<CreateAuth<DataModel>> => {
      registrationAuth =
        registrationAuth ??
        routeConfig.getRegistrationAuth?.() ??
        (createAuth({} as any) as ReturnType<CreateAuth<DataModel>>);
      return registrationAuth;
    };

    let trustedOriginsOption = routeConfig.trustedOrigins;
    let trustedOriginsInitPromise: Promise<void> | undefined;
    const ensureTrustedOrigins = async () => {
      if (trustedOriginsOption !== undefined) {
        return;
      }

      trustedOriginsInitPromise =
        trustedOriginsInitPromise ??
        (async () => {
          const auth = getRegistrationAuth();
          trustedOriginsOption =
            auth.options.trustedOrigins ??
            (await auth.$context).options.trustedOrigins ??
            [];
        })();
      await trustedOriginsInitPromise;
    };

    const authRequestHandler = httpActionGeneric(async (ctx, request) => {
      const auth = createAuth(ctx as any);
      if (config?.verbose) {
        // eslint-disable-next-line no-console
        console.log("options.baseURL", auth.options.baseURL);
        // eslint-disable-next-line no-console
        console.log("request headers", request.headers);
      }
      if (trustedOriginsOption === undefined && opts.cors) {
        trustedOriginsOption =
          auth.options.trustedOrigins ??
          (await auth.$context).options.trustedOrigins ??
          [];
      }
      const response = await auth.handler(request);
      if (config?.verbose) {
        // eslint-disable-next-line no-console
        console.log("response headers", response.headers);
      }
      return response;
    });
    const wellKnown = http.lookup("/.well-known/openid-configuration", "GET");

    if (!wellKnown) {
      http.route({
        path: "/.well-known/openid-configuration",
        method: "GET",
        handler: httpActionGeneric(async () => {
          const url = `${process.env.CONVEX_SITE_URL}${routeConfig.path}/convex/.well-known/openid-configuration`;
          return Response.redirect(url);
        }),
      });
    }

    if (!opts.cors) {
      http.route({
        pathPrefix: `${routeConfig.path}/`,
        method: "GET",
        handler: authRequestHandler,
      });

      http.route({
        pathPrefix: `${routeConfig.path}/`,
        method: "POST",
        handler: authRequestHandler,
      });

      return;
    }

    const corsOpts =
      typeof opts.cors === "boolean"
        ? { allowedOrigins: [], allowedHeaders: [], exposedHeaders: [] }
        : opts.cors;
    const cors = corsRouter(http, {
      allowedOrigins: async (request) => {
        await ensureTrustedOrigins();
        const resolvedTrustedOrigins = trustedOriginsOption ?? [];
        const rawOrigins = Array.isArray(resolvedTrustedOrigins)
          ? resolvedTrustedOrigins
          : await resolvedTrustedOrigins(request);
        const trustedOrigins = rawOrigins.filter(
          (origin): origin is string => typeof origin === "string"
        );
        return trustedOrigins
          .map((origin) =>
            origin.endsWith("*") && origin.length > 1
              ? origin.slice(0, -1)
              : origin
          )
          .concat(corsOpts.allowedOrigins ?? []);
      },
      allowCredentials: true,
      allowedHeaders: [
        "Content-Type",
        "Better-Auth-Cookie",
        "Authorization",
      ].concat(corsOpts.allowedHeaders ?? []),
      exposedHeaders: ["Set-Better-Auth-Cookie"].concat(
        corsOpts.exposedHeaders ?? []
      ),
      debug: config?.verbose,
      enforceAllowOrigins: false,
    });

    cors.route({
      pathPrefix: `${routeConfig.path}/`,
      method: "GET",
      handler: authRequestHandler,
    });

    cors.route({
      pathPrefix: `${routeConfig.path}/`,
      method: "POST",
      handler: authRequestHandler,
    });
  };

  return {
    /**
     * Returns the Convex database adapter for use in Better Auth options.
     * @param ctx - The Convex context
     * @returns The Convex database adapter
     */
    adapter: (ctx: GenericCtx<DataModel>) =>
      convexAdapter<DataModel, typeof ctx, Schema>(ctx, component, {
        ...config,
        debugLogs: config?.verbose,
      }),

    /**
     * Returns the Better Auth auth object and headers for using Better Auth API
     * methods directly in a Convex mutation or query. Convex functions don't
     * have access to request headers, so the headers object is created at
     * runtime with the token for the current session as a Bearer token.
     *
     * @param createAuth - The createAuth function
     * @param ctx - The Convex context
     * @returns A promise that resolves to the Better Auth `auth` API object and
     * headers.
     */
    getAuth: async <T extends CreateAuth<DataModel>>(
      createAuth: T,
      ctx: GenericCtx<DataModel>
    ) => ({
      auth: createAuth(ctx) as ReturnType<T>,
      headers: await getHeaders(ctx),
    }),

    /**
     * Returns a Headers object for the current session using the session id
     * from the current user identity via `ctx.auth.getUserIdentity()`. This is
     * used to pass the headers to the Better Auth API methods when using the
     * `getAuth` method.
     *
     * @param ctx - The Convex context
     * @returns The headers
     */
    getHeaders,

    /**
     * Returns the current user or null if the user is not found
     * @param ctx - The Convex context
     * @returns The user or null if the user is not found
     */
    safeGetAuthUser,

    /**
     * Returns the current user or throws an error if the user is not found
     *
     * @param ctx - The Convex context
     * @returns The user or throws an error if the user is not found
     */
    getAuthUser,

    /**
     * Returns a user by their Better Auth user id.
     * @param ctx - The Convex context
     * @param id - The Better Auth user id
     * @returns The user or null if the user is not found
     */
    getAnyUserById: async (ctx: GenericCtx<DataModel>, id: string) => {
      return (await ctx.runQuery(component.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", value: id }],
      })) as BetterAuthDataModel["user"]["document"] | null;
    },

    /**
     * Replaces 0.7 behavior of returning a new user id from
     * onCreateUser
     * @param ctx - The Convex context
     * @param authId - The Better Auth user id
     * @param userId - The app user id
     * @deprecated in 0.9
     */
    setUserId: async (
      ctx: GenericMutationCtx<DataModel>,
      authId: string,
      userId: string
    ) => {
      await ctx.runMutation(component.adapter.updateOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: authId }],
          update: { userId },
        },
      });
    },

    /**
     * Exposes functions for use with the ClientAuthBoundary component. Currently
     * only contains getAuthUser.
     * @returns Functions to pass to the ClientAuthBoundary component.
     */
    clientApi: () => ({
      /**
       * Convex query to get the current user. For use with the ClientAuthBoundary component.
       *
       * ```ts title="convex/auth.ts"
       * export const { getAuthUser } = authComponent.clientApi();
       * ```
       *
       * @returns The user or throws an error if the user is not found
       */
      getAuthUser: queryGeneric({
        args: {},
        handler: async (ctx: GenericCtx<DataModel>) => {
          return await getAuthUser(ctx);
        },
      }),
    }),

    /**
     * Exposes functions for executing trigger callbacks in the app context.
     *
     * Callbacks are defined in the `triggers` option to the component client config.
     *
     * See {@link createClient} for more information.
     *
     * @returns Functions to execute trigger callbacks in the app context.
     */
    triggersApi: () => ({
      onCreate: internalMutationGeneric({
        args: {
          doc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onCreate?.(ctx, args.doc);
        },
      }),
      onUpdate: internalMutationGeneric({
        args: {
          oldDoc: v.any(),
          newDoc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onUpdate?.(
            ctx,
            args.newDoc,
            args.oldDoc
          );
        },
      }),
      onDelete: internalMutationGeneric({
        args: {
          doc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onDelete?.(ctx, args.doc);
        },
      }),
    }),

    registerRoutes: <T extends CreateAuth<DataModel>>(
      http: HttpRouter,
      createAuth: T,
      opts: RegisterRoutesOptions = {}
    ) => {
      const staticAuth = createAuth({} as any);
      registerRoutesImpl(http, createAuth, opts, {
        path: opts.basePath ?? staticAuth.options.basePath ?? "/api/auth",
        trustedOrigins: opts.trustedOrigins,
        getRegistrationAuth: () => staticAuth,
      });
    },

    registerRoutesLazy: <T extends CreateAuth<DataModel>>(
      http: HttpRouter,
      createAuth: T,
      opts: RegisterRoutesLazyOptions<DataModel> = {}
    ) => {
      const routeInfoOptions = resolveRouteInfoOptions<DataModel>(opts.options);
      registerRoutesImpl(http, createAuth, opts, {
        path: opts.basePath ?? (routeInfoOptions?.basePath || "/api/auth"),
        trustedOrigins:
          opts.trustedOrigins ?? getTrustedOriginsFromOptions(routeInfoOptions),
      });
    },
  };
};

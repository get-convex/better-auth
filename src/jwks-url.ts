export const getJwksUrl = (siteUrl: string, basePath: string | undefined) => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const configuredBasePath = basePath ?? "/api/auth";
  const trimmedBasePath = configuredBasePath.replace(/^\/+|\/+$/g, "");
  const normalizedBasePath = trimmedBasePath ? `/${trimmedBasePath}` : "";
  return `${normalizedSiteUrl}${normalizedBasePath}/convex/jwks`;
};

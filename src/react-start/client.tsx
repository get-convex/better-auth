import {
  type DefaultError,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

export const useAuthQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const isEnabled =
    options.enabled !== undefined
      ? options.enabled
      : !isLoading && isAuthenticated;
  const result = useQuery({ ...options }, queryClient);

  // Capture preloaded data once
  const [data, setData] = useState(result.data);
  useEffect(() => {
    if (!isLoading) {
      setData(result.data);
    }
  }, [result.data, isLoading]);

  if (options.queryKey.indexOf("auth:getCurrentUser") !== -1) {
    console.log({
      isLoading,
      isAuthenticated,
      isEnabled,
      error: result.error,
      data: result.data,
      options,
    });
  }
  return { ...result, data };
};

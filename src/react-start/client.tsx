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
  const isEnabled = isAuthenticated
    ? options.enabled
    : !isLoading && isAuthenticated;
  const result = useQuery({ ...options, enabled: isEnabled }, queryClient);

  // Capture preloaded data once
  const [data, setData] = useState(result.data);
  useEffect(() => {
    if (!isLoading) {
      setData(result.data);
    }
  }, [result.data, isLoading]);

  return { ...result, data };
};

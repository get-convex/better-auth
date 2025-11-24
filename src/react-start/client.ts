import { DefaultError, QueryClient, QueryKey } from "@tanstack/query-core";
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

export const useAuthSuspenseQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseSuspenseQueryResult<TData, TError> => {
  const { isLoading } = useConvexAuth();
  const result = useSuspenseQuery(options, queryClient);
  const [data, setData] = useState(result.data);
  useEffect(() => {
    if (!isLoading) {
      setData(result.data);
    }
  }, [result.data, isLoading]);
  return { ...result, data };
};

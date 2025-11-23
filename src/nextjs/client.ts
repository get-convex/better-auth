import {
  Preloaded,
  useConvexAuth,
  usePreloadedQuery as useConvexPreloadedQuery,
} from "convex/react";
import { FunctionReference } from "convex/server";
import { useEffect, useState } from "react";

export const usePreloadedQuery = <Query extends FunctionReference<"query">>(
  preloadedQuery: Preloaded<Query>
): Query["_returnType"] => {
  const { isLoading } = useConvexAuth();
  const latestData = useConvexPreloadedQuery(preloadedQuery);
  const [data, setData] = useState(latestData);
  useEffect(() => {
    if (!isLoading) {
      setData(latestData);
    }
  }, [latestData, isLoading]);
  return data;
};

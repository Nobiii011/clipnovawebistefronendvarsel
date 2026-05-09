// src/hooks/useAnalytics.js
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { getAnalyticsOverview, getTimeSeries } from "../services/analytics.service";

export function useAnalyticsOverview(params) {
  return useQuery({
    queryKey: queryKeys.analyticsOverview(),
    queryFn: () => getAnalyticsOverview(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTimeSeries(params) {
  return useQuery({
    queryKey: queryKeys.timeseries(params),
    queryFn: () => getTimeSeries(params),
    staleTime: 1000 * 60 * 5,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// src/lib/queryClient.js
// Centralized QueryClient config.
// - No retry on 401/403 (auth errors are not transient)
// - Max 1 retry on 500/network errors
// - sane staleTime / gcTime defaults
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.status ?? error?.response?.status;
        // Never retry auth or permission errors
        if (status === 401 || status === 403) return false;
        // Max 1 retry for server/network errors
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

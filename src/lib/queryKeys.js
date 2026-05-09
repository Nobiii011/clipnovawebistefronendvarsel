// src/lib/queryKeys.js
// Single source of truth for all React Query cache keys.
// Structured as factories so invalidation is precise.

export const queryKeys = {
  // Auth
  me: () => ["auth", "me"],

  // Videos
  videos: () => ["videos"],
  video: (id) => ["videos", id],

  // Analytics
  analyticsOverview: () => ["analytics", "overview"],

  // Wallet
  wallet: () => ["wallet"],
  transactions: (filters) => ["wallet", "transactions", filters ?? {}],

  // Withdrawals
  withdrawals: () => ["withdrawals"],

  // Analytics timeseries (creator)
  timeseries: (params) => ["analytics", "timeseries", params ?? {}],
};

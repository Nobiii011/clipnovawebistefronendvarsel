// src/hooks/useWallet.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { getWallet, getTransactions, getWithdrawals, requestWithdrawal } from "../services/wallet.service";

export function useWallet() {
  return useQuery({
    queryKey: queryKeys.wallet(),
    queryFn: getWallet,
    staleTime: 1000 * 60,
  });
}

export function useTransactions(filters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => getTransactions(filters),
    staleTime: 1000 * 60,
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: queryKeys.withdrawals(),
    queryFn: getWithdrawals,
    staleTime: 1000 * 60,
  });
}

export function useRequestWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, paymentMethod }) => requestWithdrawal(amount, paymentMethod),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallet() });
      qc.invalidateQueries({ queryKey: queryKeys.withdrawals() });
    },
  });
}

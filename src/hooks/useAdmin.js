// src/hooks/useAdmin.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers, blockUser, unblockUser,
  getAdminWithdrawals, approveWithdrawal, rejectWithdrawal, markWithdrawalPaid,
  getFraudFlags, resolveFlag,
  getAuditLogs,
  getAdminVideos, adminDeleteVideo,
  getSettings, updateSettings,
  getAdminDashboard,
} from "../services/admin.service";

const K = {
  adminDashboard: () => ["admin", "dashboard"],
  adminUsers: (p) => ["admin", "users", p ?? {}],
  adminWithdrawals: (p) => ["admin", "withdrawals", p ?? {}],
  fraudFlags: (p) => ["admin", "fraud", p ?? {}],
  auditLogs: (p) => ["admin", "audit", p ?? {}],
  adminVideos: (p) => ["admin", "videos", p ?? {}],
  settings: () => ["admin", "settings"],
};

export { K as adminQueryKeys };

export function useAdminDashboard(params) {
  return useQuery({ queryKey: K.adminDashboard(), queryFn: () => getAdminDashboard(params), staleTime: 60000 });
}

export function useAdminUsers(params) {
  return useQuery({ queryKey: K.adminUsers(params), queryFn: () => getAdminUsers(params), staleTime: 30000 });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => blockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => unblockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminWithdrawals(params) {
  return useQuery({ queryKey: K.adminWithdrawals(params), queryFn: () => getAdminWithdrawals(params), staleTime: 30000 });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }) => approveWithdrawal(id, adminNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }) => rejectWithdrawal(id, adminNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}

export function useMarkWithdrawalPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => markWithdrawalPaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}

export function useFraudFlags(params) {
  return useQuery({ queryKey: K.fraudFlags(params), queryFn: () => getFraudFlags(params), staleTime: 30000 });
}

export function useResolveFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => resolveFlag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fraud"] }),
  });
}

export function useAuditLogs(params) {
  return useQuery({ queryKey: K.auditLogs(params), queryFn: () => getAuditLogs(params), staleTime: 30000 });
}

export function useAdminVideos(params) {
  return useQuery({ queryKey: K.adminVideos(params), queryFn: () => getAdminVideos(params), staleTime: 30000 });
}

export function useAdminDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminDeleteVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "videos"] }),
  });
}

export function useSettings() {
  return useQuery({ queryKey: K.settings(), queryFn: getSettings, staleTime: 60000 });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings) => updateSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.settings() }),
  });
}

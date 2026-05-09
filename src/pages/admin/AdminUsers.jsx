// src/pages/admin/AdminUsers.jsx
import { useState, useCallback } from "react";
import { Search, ShieldOff, ShieldCheck, User } from "lucide-react";
import { useAdminUsers, useBlockUser, useUnblockUser } from "../../hooks/useAdmin";
import { Badge, AdminTable, Pagination, Modal } from "../../Components/admin/AdminShared";
import { ErrorState, EmptyState } from "../../Components/ui/States";
import Toast from "../../Components/ui/Toast";
import { formatDate } from "../../lib/formatters";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { user, action }

  const { data, isLoading, isError, error, refetch } = useAdminUsers({ page, limit: 20, role: role || undefined, status: status || undefined });
  const blockMut = useBlockUser();
  const unblockMut = useUnblockUser();

  const handleAction = useCallback(async () => {
    if (!confirmModal) return;
    const { user, action } = confirmModal;
    setConfirmModal(null);
    try {
      if (action === "block") await blockMut.mutateAsync(user._id);
      else await unblockMut.mutateAsync(user._id);
      setToast({ type: "success", message: `User ${action === "block" ? "blocked" : "unblocked"}.` });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }, [confirmModal, blockMut, unblockMut]);

  return (
    <div className="space-y-6 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-white/40 text-sm mt-1">{data?.total ?? "—"} total users</p>
        </div>
        <div className="flex gap-2">
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="">All Roles</option>
            <option value="CREATOR_ADMIN">Creator</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : (
          <>
            <AdminTable headers={["User", "Role", "Status", "Joined", "Actions"]} loading={isLoading}>
              <tbody className="divide-y divide-white/5">
                {data?.users?.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState icon={<User size={36} />} title="No users found" /></td></tr>
                ) : data?.users?.map((u) => (
                  <tr key={u._id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-white/40">{u.email}</p>
                    </td>
                    <td className="px-4 py-3"><Badge value={u.role} label={u.role === "SUPER_ADMIN" ? "Admin" : "Creator"} /></td>
                    <td className="px-4 py-3"><Badge value={u.status} /></td>
                    <td className="px-4 py-3 text-white/50 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.role !== "SUPER_ADMIN" && (
                        u.status === "ACTIVE" ? (
                          <button onClick={() => setConfirmModal({ user: u, action: "block" })}
                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition">
                            <ShieldOff size={13} /> Block
                          </button>
                        ) : (
                          <button onClick={() => setConfirmModal({ user: u, action: "unblock" })}
                            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition">
                            <ShieldCheck size={13} /> Unblock
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
            <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === "block" ? "Block User" : "Unblock User"}>
        <p className="text-white/70 text-sm mb-5">
          {confirmModal?.action === "block"
            ? `Block "${confirmModal?.user?.name}"? They will lose access immediately.`
            : `Unblock "${confirmModal?.user?.name}"? They will regain access.`}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setConfirmModal(null)}
            className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15 transition">Cancel</button>
          <button onClick={handleAction}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${confirmModal?.action === "block" ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}`}>
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}

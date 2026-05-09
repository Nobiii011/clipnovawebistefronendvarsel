// src/pages/admin/AdminWithdrawals.jsx
import { useState, useCallback } from "react";
import { Wallet } from "lucide-react";
import { useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal, useMarkWithdrawalPaid } from "../../hooks/useAdmin";
import { Badge, AdminTable, Pagination, Modal } from "../../components/admin/AdminShared";
import { ErrorState, EmptyState } from "../../components/ui/States";
import Toast from "../../components/ui/Toast";
import { formatCurrency, formatDate } from "../../lib/formatters";

const TABS = ["", "PENDING", "APPROVED", "PAID", "REJECTED"];
const TAB_LABELS = { "": "All", PENDING: "Pending", APPROVED: "Approved", PAID: "Paid", REJECTED: "Rejected" };

export default function AdminWithdrawals() {
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { withdrawal, action }
  const [adminNote, setAdminNote] = useState("");
  const [toast, setToast] = useState(null);

  const params = { page, limit: 20, ...(tab ? { status: tab } : {}) };
  const { data, isLoading, isError, error, refetch } = useAdminWithdrawals(params);
  const approveMut = useApproveWithdrawal();
  const rejectMut = useRejectWithdrawal();
  const paidMut = useMarkWithdrawalPaid();

  const openModal = (withdrawal, action) => { setModal({ withdrawal, action }); setAdminNote(""); };
  const closeModal = () => { setModal(null); setAdminNote(""); };

  const handleAction = useCallback(async () => {
    if (!modal) return;
    const { withdrawal, action } = modal;
    closeModal();
    try {
      if (action === "approve") await approveMut.mutateAsync({ id: withdrawal._id, adminNote });
      else if (action === "reject") await rejectMut.mutateAsync({ id: withdrawal._id, adminNote });
      else await paidMut.mutateAsync(withdrawal._id);
      setToast({ type: "success", message: `Withdrawal ${action}d.` });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }, [modal, adminNote, approveMut, rejectMut, paidMut]);

  return (
    <div className="space-y-6 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-white/40 text-sm mt-1">{data?.total ?? "—"} total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : (
          <>
            <AdminTable headers={["Creator", "Amount", "Method", "Status", "Date", "Actions"]} loading={isLoading}>
              <tbody className="divide-y divide-white/5">
                {data?.withdrawals?.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon={<Wallet size={36} />} title="No withdrawals" /></td></tr>
                ) : data?.withdrawals?.map((w) => (
                  <tr key={w._id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{w.creatorId?.name ?? "—"}</p>
                      <p className="text-xs text-white/40">{w.creatorId?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(w.amount)}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">
                      <p>{w.paymentMethod?.type?.toUpperCase()}</p>
                      <p className="text-white/30">{w.paymentMethod?.upiId ?? w.paymentMethod?.paypalEmail ?? ""}</p>
                    </td>
                    <td className="px-4 py-3"><Badge value={w.status} /></td>
                    <td className="px-4 py-3 text-white/40 text-xs">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {w.status === "PENDING" && (
                          <>
                            <button onClick={() => openModal(w, "approve")}
                              className="text-xs text-green-400 hover:text-green-300 transition">Approve</button>
                            <button onClick={() => openModal(w, "reject")}
                              className="text-xs text-red-400 hover:text-red-300 transition">Reject</button>
                          </>
                        )}
                        {w.status === "APPROVED" && (
                          <button onClick={() => openModal(w, "paid")}
                            className="text-xs text-blue-400 hover:text-blue-300 transition">Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
            <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!modal} onClose={closeModal}
        title={modal?.action === "approve" ? "Approve Withdrawal" : modal?.action === "reject" ? "Reject Withdrawal" : "Mark as Paid"}>
        {modal && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 text-sm space-y-1">
              <p><span className="text-white/50">Creator:</span> {modal.withdrawal.creatorId?.name}</p>
              <p><span className="text-white/50">Amount:</span> {formatCurrency(modal.withdrawal.amount)}</p>
              <p><span className="text-white/50">Method:</span> {modal.withdrawal.paymentMethod?.type?.toUpperCase()} — {modal.withdrawal.paymentMethod?.upiId ?? modal.withdrawal.paymentMethod?.paypalEmail ?? "—"}</p>
            </div>
            {modal.action !== "paid" && (
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Admin Note (optional)</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none resize-none" />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15 transition">Cancel</button>
              <button onClick={handleAction}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${modal.action === "reject" ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}`}>
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

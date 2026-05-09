// src/pages/admin/AdminAuditLogs.jsx
import { useState } from "react";
import { FileText } from "lucide-react";
import { useAuditLogs } from "../../hooks/useAdmin";
import { AdminTable, Pagination, Modal } from "../../components/admin/AdminShared";
import { ErrorState, EmptyState } from "../../components/ui/States";
import Toast from "../../components/ui/Toast";
import { formatDateTime } from "../../lib/formatters";

const ACTION_COLORS = {
  USER_LOGIN: "text-blue-400",
  USER_LOGOUT: "text-blue-300",
  VIDEO_CREATED: "text-green-400",
  VIDEO_DELETED: "text-red-400",
  VIDEO_UPDATED: "text-yellow-400",
  WITHDRAWAL_REQUESTED: "text-purple-400",
  WITHDRAWAL_APPROVED: "text-green-400",
  WITHDRAWAL_REJECTED: "text-red-400",
  WITHDRAWAL_PAID: "text-green-300",
  ADMIN_BLOCK_USER: "text-red-400",
  ADMIN_UNBLOCK_USER: "text-green-400",
  SETTINGS_UPDATED: "text-orange-400",
  FRAUD_FLAG_RESOLVED: "text-cyan-400",
};

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [detailLog, setDetailLog] = useState(null);

  const params = { page, limit: 30, ...(action ? { action } : {}), ...(entityType ? { entityType } : {}) };
  const { data, isLoading, isError, error, refetch } = useAuditLogs(params);

  const ACTIONS = [
    "USER_LOGIN","USER_LOGOUT","VIDEO_CREATED","VIDEO_DELETED","VIDEO_UPDATED",
    "WITHDRAWAL_REQUESTED","WITHDRAWAL_APPROVED","WITHDRAWAL_REJECTED","WITHDRAWAL_PAID",
    "ADMIN_BLOCK_USER","ADMIN_UNBLOCK_USER","SETTINGS_UPDATED","FRAUD_FLAG_RESOLVED",
  ];
  const ENTITY_TYPES = ["USER","VIDEO","WITHDRAWAL","LINK","SYSTEM","FRAUD"];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-white/40 text-sm mt-1">{data?.total ?? "—"} total entries</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="">All Actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
          </select>
          <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="">All Types</option>
            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : (
          <>
            <AdminTable headers={["Actor", "Action", "Entity", "IP", "Time", ""]} loading={isLoading}>
              <tbody className="divide-y divide-white/5">
                {data?.logs?.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon={<FileText size={36} />} title="No audit logs" /></td></tr>
                ) : data?.logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{log.userId?.name ?? "System"}</p>
                      <p className="text-xs text-white/40">{log.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-medium ${ACTION_COLORS[log.action] ?? "text-white/60"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      <p>{log.entityType}</p>
                      {log.entityId && <p className="text-white/30 font-mono">{String(log.entityId).slice(-8)}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 font-mono">{log.ip ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <button onClick={() => setDetailLog(log)}
                          className="text-xs text-white/40 hover:text-white transition">Details</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
            <Pagination page={page} total={data?.total ?? 0} limit={30} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!detailLog} onClose={() => setDetailLog(null)} title="Log Details" maxWidth="max-w-2xl">
        {detailLog && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Action:</span> <span className={ACTION_COLORS[detailLog.action]}>{detailLog.action}</span></div>
              <div><span className="text-white/40">Entity:</span> {detailLog.entityType}</div>
              <div><span className="text-white/40">Actor:</span> {detailLog.userId?.name}</div>
              <div><span className="text-white/40">Time:</span> {formatDateTime(detailLog.createdAt)}</div>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1.5">Metadata</p>
              <pre className="text-xs text-white/70 bg-black/40 rounded-xl p-4 overflow-x-auto">
                {JSON.stringify(detailLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

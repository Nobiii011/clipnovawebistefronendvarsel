// src/pages/admin/AdminFraud.jsx
import { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useFraudFlags, useResolveFlag } from "../../hooks/useAdmin";
import { Badge, Modal } from "../../Components/admin/AdminShared";
import { ErrorState, EmptyState } from "../../Components/ui/States";
import { Skeleton } from "../../Components/ui/Skeleton";
import Toast from "../../Components/ui/Toast";
import { formatDate } from "../../lib/formatters";

const TYPE_LABELS = {
  DUPLICATE_IP: "Duplicate IP",
  RATE_ABUSE: "Rate Abuse",
  BOT_PATTERN: "Bot Pattern",
  INVALID_PLAYBACK: "Invalid Playback",
  SUSPICIOUS_BEHAVIOR: "Suspicious",
};

function FlagRow({ flag, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition ${flag.resolved ? "border-white/5 opacity-60" : "border-white/10"}`}>
      <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge value={flag.severity} />
            <span className="text-sm font-medium">{TYPE_LABELS[flag.type] ?? flag.type}</span>
            {flag.resolved && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Resolved</span>}
          </div>
          <p className="text-white/60 text-xs">{flag.reason}</p>
          <div className="flex gap-4 text-xs text-white/30">
            <span>Creator: {flag.creatorId?.name ?? "—"}</span>
            <span>Video: {flag.videoId?.title ?? "—"}</span>
            <span>{formatDate(flag.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!flag.resolved && (
            <button onClick={e => { e.stopPropagation(); onResolve(flag); }}
              className="text-xs text-green-400 hover:text-green-300 transition px-2 py-1 rounded-lg hover:bg-green-500/10">
              Resolve
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 bg-white/3">
          <p className="text-xs text-white/40 mb-2">Session ID: <code className="text-white/60">{flag.sessionId}</code></p>
          {flag.meta && Object.keys(flag.meta).length > 0 && (
            <pre className="text-xs text-white/50 bg-black/30 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(flag.meta, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminFraud() {
  const [resolved, setResolved] = useState("false");
  const [severity, setSeverity] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmFlag, setConfirmFlag] = useState(null);

  const params = {
    ...(resolved !== "" ? { resolved } : {}),
    ...(severity ? { severity } : {}),
    limit: 50,
  };
  const { data: flags = [], isLoading, isError, error, refetch } = useFraudFlags(params);
  const resolveMut = useResolveFlag();

  const handleResolve = async () => {
    if (!confirmFlag) return;
    const id = confirmFlag._id;
    setConfirmFlag(null);
    try {
      await resolveMut.mutateAsync(id);
      setToast({ type: "success", message: "Flag resolved." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fraud Flags</h1>
          <p className="text-white/40 text-sm mt-1">{flags.length} flags shown</p>
        </div>
        <div className="flex gap-2">
          <select value={resolved} onChange={e => setResolved(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
            <option value="">All</option>
          </select>
          <select value={severity} onChange={e => setSeverity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
            <option value="">All Severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : flags.length === 0 ? (
        <EmptyState icon={<Shield size={40} />} title="No fraud flags" description="Platform looks clean" />
      ) : (
        <div className="space-y-3">
          {flags.map(f => <FlagRow key={f._id} flag={f} onResolve={setConfirmFlag} />)}
        </div>
      )}

      <Modal open={!!confirmFlag} onClose={() => setConfirmFlag(null)} title="Resolve Fraud Flag">
        <p className="text-white/70 text-sm mb-5">
          Mark this <strong>{confirmFlag?.severity}</strong> {confirmFlag?.type} flag as resolved?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setConfirmFlag(null)} className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15 transition">Cancel</button>
          <button onClick={handleResolve} className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-500 transition">Resolve</button>
        </div>
      </Modal>
    </div>
  );
}

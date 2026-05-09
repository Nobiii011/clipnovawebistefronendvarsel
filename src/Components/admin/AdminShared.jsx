// src/components/admin/AdminShared.jsx
// Shared components used across all admin pages.

import { X, ChevronLeft, ChevronRight } from "lucide-react";

// ── Status / Role Badges ──────────────────────────────────────────────────────
const BADGE_MAP = {
  // User status
  ACTIVE:   "bg-green-500/20 text-green-400 border-green-500/30",
  BLOCKED:  "bg-red-500/20 text-red-400 border-red-500/30",
  // Withdrawal status
  PENDING:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID:     "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED:"bg-white/10 text-white/40 border-white/10",
  // Fraud severity
  LOW:      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  MEDIUM:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  HIGH:     "bg-red-500/20 text-red-400 border-red-500/30",
  // Video status
  READY:    "bg-green-500/20 text-green-400 border-green-500/30",
  UPLOADING:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:   "bg-red-500/20 text-red-400 border-red-500/30",
  DELETED:  "bg-white/10 text-white/30 border-white/10",
  // Roles
  SUPER_ADMIN:   "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CREATOR_ADMIN: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export function Badge({ value, label }) {
  const cls = BADGE_MAP[value] ?? "bg-white/10 text-white/50 border-white/10";
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium ${cls}`}>
      {label ?? value}
    </span>
  );
}

// ── Admin Stat Card ───────────────────────────────────────────────────────────
export function AdminStatCard({ icon: Icon, label, value, sub, color = "bg-white/10", loading }) {
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-3" />
        <div className="h-8 bg-white/10 rounded w-32" />
      </div>
    );
  }
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-white/50 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit) || 1;
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 text-sm text-white/50">
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white/70">{page} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Table skeleton ────────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + (j * 13) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ── Admin Table wrapper ───────────────────────────────────────────────────────
export function AdminTable({ headers, children, loading, rows = 5, cols }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        {loading ? <TableSkeleton rows={rows} cols={cols ?? headers.length} /> : children}
      </table>
    </div>
  );
}

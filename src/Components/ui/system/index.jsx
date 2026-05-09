// src/components/ui/system/index.jsx
import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg", footer }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition p-1 rounded-lg hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/10 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, children, side = "right" }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  return createPortal(
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`absolute top-0 ${side === "right" ? "right-0" : "left-0"} h-full w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition p-1 rounded-lg hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15 text-white transition disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 ${danger ? "bg-red-600 hover:bg-red-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"}`}>
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        {danger && <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />}
        <p className="text-white/70 text-sm leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function Tooltip({ children, content, position = "top" }) {
  const [visible, setVisible] = useState(false);
  const posClass = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];
  return (
    <div className="relative inline-flex"
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {children}
      {visible && content && (
        <div className={`absolute z-50 ${posClass} px-2.5 py-1.5 bg-neutral-800 border border-white/10 rounded-lg text-xs text-white/80 whitespace-nowrap pointer-events-none shadow-lg`}>
          {content}
        </div>
      )}
    </div>
  );
}

// src/components/ui/States.jsx
import { RefreshCw } from "lucide-react";

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-white/20 mb-2">{icon}</div>}
      <p className="text-white/60 font-medium">{title}</p>
      {description && <p className="text-white/30 text-sm">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-red-400 text-sm">{message || "Something went wrong."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

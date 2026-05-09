// src/components/ui/Toast.jsx
// Minimal self-contained toast. Usage:
//   const [toast, setToast] = useState(null);
//   setToast({ type: "success", message: "Done!" });
//   <Toast toast={toast} onClose={() => setToast(null)} />

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all
        ${isSuccess
          ? "bg-green-950 border-green-700 text-green-300"
          : "bg-red-950 border-red-700 text-red-300"
        }`}
    >
      {isSuccess ? <CheckCircle size={18} /> : <XCircle size={18} />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

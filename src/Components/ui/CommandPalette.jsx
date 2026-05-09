// src/components/ui/CommandPalette.jsx
// Ctrl+K global search — searches videos from real API
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Video, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useVideos } from "../../hooks/useVideos";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(p => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const { data: allVideos = [] } = useVideos();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const results = query.trim()
    ? allVideos.filter(v => v.title?.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : allVideos.slice(0, 6);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/30 hover:text-white transition">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-xs text-white/20 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-10 text-center text-white/30 text-sm">
              {query ? `No videos found for "${query}"` : "No videos yet"}
            </div>
          ) : (
            <div className="p-2">
              <p className="text-xs text-white/30 px-3 py-1.5 uppercase tracking-wider">
                {query ? "Search Results" : "Recent Videos"}
              </p>
              {results.map(v => (
                <Link
                  key={v._id}
                  to={`/videos/${v._id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition group"
                >
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Video size={14} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{v.title}</p>
                    <p className="text-xs text-white/30">{v.status}</p>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-xs text-white/20">
          <span><kbd className="bg-white/5 border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="bg-white/5 border border-white/10 rounded px-1">↵</kbd> open</span>
          <span><kbd className="bg-white/5 border border-white/10 rounded px-1">ESC</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

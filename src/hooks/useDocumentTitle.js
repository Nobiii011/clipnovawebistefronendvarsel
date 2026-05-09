// src/hooks/useDocumentTitle.js
import { useEffect } from "react";

const BASE = "ClipNova";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;
    return () => { document.title = BASE; };
  }, [title]);
}

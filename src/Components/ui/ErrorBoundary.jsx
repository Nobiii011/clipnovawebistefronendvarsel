// src/components/ui/ErrorBoundary.jsx
import { Component } from "react";
import { RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Sentry.captureException(error, { extra: info }); // plug in when ready
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white p-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-white/40 text-sm">
              {import.meta.env.DEV ? this.state.error?.message : "An unexpected error occurred. Please refresh the page."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 transition"
            >
              <RefreshCw size={15} /> Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

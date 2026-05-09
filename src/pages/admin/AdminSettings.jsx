// src/pages/admin/AdminSettings.jsx
import { useState, useEffect, useCallback } from "react";
import { Settings, Save, RotateCcw } from "lucide-react";
import { useSettings, useUpdateSettings } from "../../hooks/useAdmin";
import { ErrorState } from "../../Components/ui/States";
import { Skeleton } from "../../Components/ui/Skeleton";
import Toast from "../../Components/ui/Toast";

const SETTING_META = {
  earningsPerValidView:    { label: "Earnings Per Valid View (₹)", type: "number", step: "0.001", min: 0, group: "Earnings" },
  minimumWithdrawalAmount: { label: "Minimum Withdrawal Amount (₹)", type: "number", step: "1", min: 0, group: "Withdrawals" },
  maxViewsPerIpPerHour:    { label: "Max Views Per IP Per Hour", type: "number", step: "1", min: 1, group: "Fraud Prevention" },
  minimumWatchSeconds:     { label: "Minimum Watch Seconds", type: "number", step: "1", min: 0, group: "Fraud Prevention" },
  maxUploadSizeBytes:      { label: "Max Upload Size (bytes)", type: "number", step: "1048576", min: 1024, group: "Upload" },
  maintenanceMode:         { label: "Maintenance Mode", type: "boolean", group: "System" },
  telegramBotEnabled:      { label: "Telegram Bot Enabled", type: "boolean", group: "System" },
  allowedVideoMimeTypes:   { label: "Allowed Video MIME Types", type: "mimelist", group: "Upload" },
};

const GROUPS = ["Earnings", "Withdrawals", "Fraud Prevention", "Upload", "System"];

export default function AdminSettings() {
  const { data: settings = [], isLoading, isError, error, refetch } = useSettings();
  const updateMut = useUpdateSettings();
  const [values, setValues] = useState({});
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);

  // Populate form from fetched settings
  useEffect(() => {
    if (!settings.length) return;
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    setValues(map);
    setDirty(false);
  }, [settings]);

  const handleChange = useCallback((key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleReset = () => {
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    setValues(map);
    setDirty(false);
  };

  const handleSave = async () => {
    const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
    try {
      await updateMut.mutateAsync(payload);
      setDirty(false);
      setToast({ type: "success", message: "Settings saved." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  const renderField = (key) => {
    const meta = SETTING_META[key];
    if (!meta) return null;
    const value = values[key];

    if (meta.type === "boolean") {
      return (
        <label key={key} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
          <span className="text-sm text-white/80">{meta.label}</span>
          <button
            onClick={() => handleChange(key, !value)}
            className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-green-500" : "bg-white/20"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
          </button>
        </label>
      );
    }

    if (meta.type === "mimelist") {
      const mimes = ["video/mp4", "video/quicktime", "video/webm"];
      const current = Array.isArray(value) ? value : [];
      return (
        <div key={key} className="py-3 border-b border-white/5 last:border-0">
          <p className="text-sm text-white/80 mb-2">{meta.label}</p>
          <div className="flex gap-2 flex-wrap">
            {mimes.map(m => (
              <button key={m} onClick={() => {
                const next = current.includes(m) ? current.filter(x => x !== m) : [...current, m];
                if (next.length > 0) handleChange(key, next);
              }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${current.includes(m) ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" : "bg-white/5 border-white/10 text-white/50"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="py-3 border-b border-white/5 last:border-0">
        <label className="block text-sm text-white/80 mb-1.5">{meta.label}</label>
        <input
          type="number"
          value={value ?? ""}
          onChange={e => handleChange(key, parseFloat(e.target.value))}
          step={meta.step}
          min={meta.min}
          className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-white/40 text-sm mt-1">Configure platform-wide parameters</p>
        </div>
        {dirty && (
          <div className="flex gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15 transition">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSave} disabled={updateMut.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition">
              {updateMut.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <div className="space-y-4">
          {GROUPS.map(group => {
            const keys = Object.entries(SETTING_META).filter(([, m]) => m.group === group).map(([k]) => k).filter(k => k in values);
            if (!keys.length) return null;
            return (
              <div key={group} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-4">{group}</h2>
                <div>{keys.map(renderField)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

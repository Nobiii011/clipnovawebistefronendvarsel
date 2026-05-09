// src/pages/creator/Settings.jsx
import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";
import { normalizeError } from "../../lib/apiError";
import Toast from "../../components/ui/Toast";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
        <Icon size={16} className="text-white/50" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition";

export default function Settings() {
  const { user, setUser } = useAuth();
  useDocumentTitle("Settings");
  const [toast, setToast] = useState(null);

  // Profile form
  const [name, setName] = useState(user?.name ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => { setName(user?.name ?? ""); }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;
    setProfileLoading(true);
    try {
      const { data } = await apiClient.patch("/users/me", { name: name.trim() });
      setUser(prev => ({ ...prev, name: data.data?.name ?? name.trim() }));
      setToast({ type: "success", message: "Profile updated." });
    } catch (err) {
      setToast({ type: "error", message: normalizeError(err).message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { setToast({ type: "error", message: "New password must be at least 8 characters." }); return; }
    if (newPassword !== confirmPassword) { setToast({ type: "error", message: "Passwords do not match." }); return; }
    setPassLoading(true);
    try {
      await apiClient.post("/auth/change-password", { currentPassword, newPassword });
      setToast({ type: "success", message: "Password changed successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setToast({ type: "error", message: normalizeError(err).message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white max-w-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Field label="Full Name">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={user?.email ?? ""} disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </Field>
          <Field label="Role">
            <input type="text" value={user?.role ?? ""} disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </Field>
          <button type="submit" disabled={profileLoading || !name.trim() || name.trim() === user?.name}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Save Profile
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Field label="Current Password">
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••" className={`${inputCls} pr-11`} required />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <input type={showPass ? "text" : "password"} value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters" className={inputCls} required minLength={8} />
          </Field>
          <Field label="Confirm New Password">
            <input type={showPass ? "text" : "password"} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className={`${inputCls} ${confirmPassword && newPassword !== confirmPassword ? "border-red-500/50" : ""}`}
              required />
          </Field>
          <button type="submit" disabled={passLoading || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {passLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
            Change Password
          </button>
        </form>
      </Section>

      {/* Telegram */}
      <Section title="Telegram Bot" icon={User}>
        <div className="space-y-3">
          <p className="text-white/50 text-sm">Connect your account to the Telegram bot to upload videos and manage earnings from Telegram.</p>
          <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">@clipnova_bot</p>
              <p className="text-white/40 text-xs mt-0.5">Send /login to link your account</p>
            </div>
            <a href="https://t.me/clipnova_bot" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[#229ED9] hover:bg-[#1a8bc4] text-white transition shrink-0">
              Open Bot
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}

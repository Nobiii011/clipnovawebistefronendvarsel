// src/pages/creator/Referrals.jsx
// Backend reality: No /referrals endpoint exists.
// Referral code is derived from user ID (standard pattern).
// Referral stats are not available from backend yet.
// This page shows the referral link and a "coming soon" state for stats.

import { useState } from "react";
import { Users, Link2, Copy, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://novax.app";

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id ?? user?._id ?? "—";
  const referralLink = `${APP_URL}/ref/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-white/40 text-sm mt-1">Invite creators and earn when they join</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-3 rounded-xl">
            <Link2 size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="font-semibold">Your Referral Link</p>
            <p className="text-white/40 text-sm">Share this link to invite creators</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none select-all"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={copyLink}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition shrink-0
              ${copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              }`}
          >
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="bg-white/3 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-white/40">
            Your referral code: <code className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">{referralCode}</code>
          </p>
        </div>
      </div>

      {/* Stats — coming soon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total Referrals", value: "—" },
          { icon: Users, label: "Active Referrals", value: "—" },
          { icon: Users, label: "Referral Earnings", value: "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <Icon size={20} className="text-white/30 mb-3" />
            <p className="text-white/40 text-xs">{label}</p>
            <p className="text-2xl font-bold text-white/30 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
        <p className="text-white/30 text-sm">
          Referral analytics are coming soon. Your referral link is active and ready to share.
        </p>
      </div>
    </div>
  );
}

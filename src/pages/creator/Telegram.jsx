// src/pages/creator/Telegram.jsx
import { useState } from "react";
import { Copy, CheckCheck, ExternalLink, Send, Upload, Link2, Zap, RefreshCw, Info } from "lucide-react";

const BOT_USERNAME = "@clipnova_bot";
const BOT_URL = "https://t.me/clipnova_bot";

const COMMANDS = [
  { cmd: "/login", desc: "Link your ClipNova account to Telegram", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { cmd: "/videos", desc: "List all your uploaded videos with share links", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { cmd: "/wallet", desc: "Check your current wallet balance", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { cmd: "/stats", desc: "View your total views, earnings, and performance", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { cmd: "/withdraw", desc: "Request a withdrawal from your wallet", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
];

const SOURCES = [
  { name: "TeraBox", icon: "📦", desc: "Paste TeraBox share link — auto imported" },
  { name: "Dailymotion", icon: "🎬", desc: "Dailymotion video URLs supported" },
  { name: "Streamtape", icon: "📼", desc: "Streamtape links auto-fetched" },
  { name: "Mixdrop", icon: "💧", desc: "Mixdrop video imports" },
  { name: "DoodStream", icon: "🎞️", desc: "DoodStream links supported" },
  { name: "Direct MP4", icon: "🎥", desc: "Any direct .mp4 URL" },
  { name: "ClipNova Reshare", icon: "🔁", desc: "Reshare existing ClipNova links" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/10">
      {copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Telegram() {
  return (
    <div className="space-y-8 text-white max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Send size={22} className="text-cyan-400" /> Telegram Import Center
        </h1>
        <p className="text-white/40 text-sm mt-1">Upload videos, import links, and manage your account — all from Telegram.</p>
      </div>

      {/* Connect Bot */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">Connect via Telegram Bot</p>
            <p className="text-white/50 text-sm mt-1">Send <code className="text-cyan-400 bg-white/10 px-1.5 py-0.5 rounded">/login</code> to link your account</p>
            <div className="flex items-center gap-2 mt-3">
              <code className="text-cyan-300 font-mono text-sm bg-white/10 px-3 py-1.5 rounded-lg">{BOT_USERNAME}</code>
              <CopyButton text={BOT_USERNAME} />
            </div>
          </div>
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-cyan-500 hover:bg-cyan-400 text-white transition shrink-0"
          >
            <Send size={16} /> Open Telegram Bot <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Commands */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold">Bot Commands</h2>
        </div>
        <div className="divide-y divide-white/5">
          {COMMANDS.map((c) => (
            <div key={c.cmd} className="flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-mono font-semibold text-sm px-3 py-1.5 rounded-lg border ${c.bg} ${c.color}`}>
                  {c.cmd}
                </span>
                <p className="text-white/50 text-sm truncate">{c.desc}</p>
              </div>
              <CopyButton text={c.cmd} />
            </div>
          ))}
        </div>
      </div>

      {/* Supported Import Sources */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold">Supported Import Sources</h2>
          <p className="text-white/40 text-xs mt-1">Paste any of these links in the bot — auto imported to your account</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-white/5 sm:divide-y-0">
          {SOURCES.map((s) => (
            <div key={s.name} className="flex items-start gap-3 px-6 py-4 border-b border-white/5 last:border-0">
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Import */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-purple-400" />
          <h2 className="font-semibold">Bulk Import</h2>
        </div>
        <p className="text-white/50 text-sm leading-relaxed">
          Forward up to <strong className="text-white">100 videos</strong> at once to the bot. Each video is queued and processed automatically.
          Share links are generated for each video as soon as processing completes.
        </p>
        <div className="bg-white/5 rounded-xl p-4 text-sm text-white/40 space-y-1">
          <p>1. Forward videos or paste links in the bot</p>
          <p>2. Bot queues each item automatically</p>
          <p>3. Share links generated on completion</p>
          <p>4. Earnings start as soon as views come in</p>
        </div>
      </div>

      {/* Reshare Flow */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-green-400" />
          <h2 className="font-semibold">ClipNova Reshare</h2>
        </div>
        <p className="text-white/50 text-sm leading-relaxed">
          Paste any existing ClipNova share link into the bot. A <strong className="text-white">new personal link</strong> is created for you.
          When viewers watch through your link, <strong className="text-white">you earn</strong> — independently from the original creator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
          {["Creator A uploads", "Creator B reshares link", "Both earn separately"].map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3">
              <span className="text-white/30 font-mono block mb-1">Step {i + 1}</span>
              <span className="text-white/70">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex gap-3">
        <Info size={18} className="text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-medium text-yellow-300">Telegram Upload Limits</p>
          <p className="text-white/50">Telegram Bot API has a <strong className="text-white">20 MB</strong> file size limit for direct uploads.</p>
          <p className="text-white/50">For larger files, use the <strong className="text-white">web upload</strong> on the Upload page, or import via TeraBox/direct MP4 link.</p>
        </div>
      </div>

    </div>
  );
}

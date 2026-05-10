// src/pages/creator/Dashboard.jsx
import { Eye, DollarSign, Video, Wallet, Upload, Send, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { useAnalyticsOverview, useTimeSeries } from "../../hooks/useAnalytics";
import { useWallet } from "../../hooks/useWallet";
import { useVideos } from "../../hooks/useVideos";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatNumber, formatDate } from "../../lib/formatters";
import { StatCardSkeleton, Skeleton } from "../../Components/ui/Skeleton";
import { ErrorState } from "../../Components/ui/States";
import { ROUTES } from "../../constants/routes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import VideoCard, { VideoCardSkeleton } from "../../components/video/VideoCard";

function StatCard({ icon: Icon, label, value, color, loading }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-white/50 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

function VideoStatusBadge({ status }) {
  const map = {
    READY:     "bg-green-500/20 text-green-400",
    UPLOADING: "bg-yellow-500/20 text-yellow-400",
    FAILED:    "bg-red-500/20 text-red-400",
    DELETED:   "bg-white/10 text-white/40",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}

function MilestoneCard({ icon, label, desc, done, progress, total }) {
  const pct = total ? Math.min(100, Math.round((progress / total) * 100)) : (done ? 100 : 0);
  return (
    <div className={`rounded-xl p-4 border transition ${done ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className={`text-sm font-medium ${done ? "text-green-400" : "text-white/70"}`}>{label}</p>
        {done && <span className="ml-auto text-green-400 text-xs">✓</span>}
      </div>
      <p className="text-white/30 text-xs mb-2">{desc}</p>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-cyan-500"}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  useDocumentTitle("Dashboard");
  const analytics = useAnalyticsOverview();
  const timeseries = useTimeSeries({ groupBy: "day" });
  const wallet = useWallet();
  const videos = useVideos();

  const isLoading = analytics.isLoading || wallet.isLoading;
  const hasError = analytics.isError || wallet.isError;
  const recentVideos = (videos.data ?? []).slice(0, 5);

  const totalViews    = analytics.data?.totalViews ?? 0;
  const totalVideos   = videos.data?.length ?? 0;
  const totalEarnings = analytics.data?.totalEarnings ?? 0;

  const MILESTONES = [
    { icon: "🎬", label: "First Upload",  desc: "Upload your first video",    done: totalVideos >= 1,    progress: totalVideos,  total: 1 },
    { icon: "👁️", label: "100 Views",     desc: "Reach 100 total views",      done: totalViews >= 100,   progress: totalViews,   total: 100 },
    { icon: "💰", label: "First Earning", desc: "Earn your first rupee",       done: totalEarnings > 0,   progress: totalEarnings > 0 ? 1 : 0, total: 1 },
    { icon: "📹", label: "5 Videos",      desc: "Upload 5 videos",             done: totalVideos >= 5,    progress: totalVideos,  total: 5 },
    { icon: "👁️", label: "1K Views",      desc: "Reach 1,000 total views",    done: totalViews >= 1000,  progress: totalViews,   total: 1000 },
    { icon: "🚀", label: "10K Views",     desc: "Reach 10,000 total views",   done: totalViews >= 10000, progress: totalViews,   total: 10000 },
  ];

  const chartData = (() => {
    const byDate = {};
    (timeseries.data ?? []).forEach(item => {
      const d = item._id?.date;
      if (!d) return;
      if (!byDate[d]) byDate[d] = { date: d, valid: 0, rejected: 0 };
      if (item._id?.viewType === "VALID") byDate[d].valid = item.count;
      if (item._id?.viewType === "REJECTED") byDate[d].rejected = item.count;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  })();

  return (
    <div className="space-y-6 text-white">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? "Creator"} 👋</h1>
          <p className="text-white/40 text-sm mt-1">Here's your performance overview</p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.UPLOAD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition">
            <Upload size={15} /> Upload
          </Link>
          <a href="https://t.me/clipnovaaBot" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/30 transition">
            <Send size={15} /> Telegram
          </a>
        </div>
      </div>

      {/* Stats */}
      {hasError ? (
        <ErrorState message="Failed to load stats" onRetry={() => { analytics.refetch(); wallet.refetch(); }} />
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard icon={Eye}      label="Total Views"       value={formatNumber(analytics.data?.totalViews)}      color="bg-blue-600"   loading={analytics.isLoading} />
          <StatCard icon={Eye}      label="Valid Views"        value={formatNumber(analytics.data?.validViews)}      color="bg-cyan-600"   loading={analytics.isLoading} />
          <StatCard icon={DollarSign} label="Total Earnings"  value={formatCurrency(analytics.data?.totalEarnings)} color="bg-green-600"  loading={analytics.isLoading} />
          <StatCard icon={Wallet}   label="Available Balance" value={formatCurrency(wallet.data?.availableBalance)} color="bg-purple-600" loading={wallet.isLoading} />
        </div>
      )}

      {/* Wallet Summary */}
      {!wallet.isLoading && wallet.data && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Wallet</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Earned",  value: formatCurrency(wallet.data.totalEarnings) },
              { label: "Available",     value: formatCurrency(wallet.data.availableBalance) },
              { label: "Pending",       value: formatCurrency(wallet.data.pendingBalance) },
              { label: "Withdrawn",     value: formatCurrency(wallet.data.lifetimeWithdrawn) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white font-semibold mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Views Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Views — Last 14 Days</h2>
        {timeseries.isLoading ? (
          <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-white/30 text-sm">No view data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }} itemStyle={{ color: "#aaa" }} />
              <Bar dataKey="valid" name="Valid" fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Milestones */}
      {!analytics.isLoading && !videos.isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-yellow-400" />
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Milestones</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MILESTONES.map(m => <MilestoneCard key={m.label} {...m} />)}
          </div>
        </div>
      )}

      {/* Recent Videos */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Recent Videos</h2>
          <Link to={ROUTES.UPLOADED_VIDEOS} className="text-xs text-cyan-400 hover:text-cyan-300 transition">View all →</Link>
        </div>
        {videos.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <VideoCardSkeleton key={i} />)}
          </div>
        ) : videos.isError ? (
          <ErrorState message="Failed to load videos" onRetry={videos.refetch} />
        ) : recentVideos.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Video size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">No videos yet</p>
            <Link to={ROUTES.UPLOAD} className="text-cyan-400 hover:text-cyan-300 text-sm transition">Upload your first video →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((v) => (
              <Link key={v._id} to={`/videos/${v._id}`}>
                <VideoCard video={v} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

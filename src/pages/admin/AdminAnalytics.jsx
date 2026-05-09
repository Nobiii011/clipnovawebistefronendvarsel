// src/pages/admin/AdminAnalytics.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useAdminDashboard } from "../../hooks/useAdmin";
import { useTimeSeries } from "../../hooks/useAnalytics";
import { AdminStatCard } from "../../Components/admin/AdminShared";
import { ErrorState } from "../../Components/ui/States";
import { formatCurrency, formatNumber } from "../../lib/formatters";
import { Eye, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const CHART_STYLE = {
  contentStyle: { background: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#aaa" },
};

function TimeSeriesChart({ data, loading }) {
  if (loading) return <div className="h-64 bg-white/5 rounded-xl animate-pulse" />;

  // Transform raw series: [{ _id: { date, viewType }, count, earnings }]
  const byDate = {};
  (data ?? []).forEach(item => {
    const d = item._id?.date;
    if (!d) return;
    if (!byDate[d]) byDate[d] = { date: d, VALID: 0, REJECTED: 0, earnings: 0 };
    byDate[d][item._id.viewType] = item.count;
    if (item._id.viewType === "VALID") byDate[d].earnings += item.earnings;
  });
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

  if (!chartData.length) return (
    <div className="h-64 flex items-center justify-center text-white/30 text-sm">No time series data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fill: "#666", fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip {...CHART_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#aaa" }} />
        <Bar dataKey="VALID" name="Valid Views" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="REJECTED" name="Rejected Views" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminAnalytics() {
  const dashboard = useAdminDashboard();
  // timeseries is CREATOR_ADMIN only — admin dashboard has its own aggregate
  const d = dashboard.data;

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Platform-wide performance metrics</p>
      </div>

      {dashboard.isError ? (
        <ErrorState message={dashboard.error?.message} onRetry={dashboard.refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard icon={Eye} label="Total Views" value={formatNumber(d?.totalViews)} color="bg-blue-600" loading={dashboard.isLoading} />
            <AdminStatCard icon={TrendingUp} label="Valid Views" value={formatNumber(d?.validViews)} color="bg-green-600" loading={dashboard.isLoading} />
            <AdminStatCard icon={TrendingDown} label="Rejected Views" value={formatNumber(d?.rejectedViews)} color="bg-red-600" loading={dashboard.isLoading} />
            <AdminStatCard icon={DollarSign} label="Total Earnings" value={formatCurrency(d?.totalEarnings)} color="bg-purple-600" loading={dashboard.isLoading} />
          </div>

          {/* Top Creators Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold">Top Creators by Earnings</h2>
            </div>
            {dashboard.isLoading ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />)}</div>
            ) : !d?.topCreators?.length ? (
              <div className="p-8 text-center text-white/30 text-sm">No earnings data yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Creator</th>
                      <th className="px-4 py-3 text-left">Valid Views</th>
                      <th className="px-4 py-3 text-left">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {d.topCreators.map((c, i) => (
                      <tr key={i} className="hover:bg-white/3 transition">
                        <td className="px-4 py-3 text-white/30">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{c.creator?.name ?? "—"}</p>
                          <p className="text-xs text-white/40">{c.creator?.email}</p>
                        </td>
                        <td className="px-4 py-3">{formatNumber(c.validViews)}</td>
                        <td className="px-4 py-3 text-green-400 font-medium">{formatCurrency(c.earnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

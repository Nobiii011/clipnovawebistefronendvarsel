// src/pages/admin/AdminDashboard.jsx
import { Users, Video, Eye, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAdminDashboard } from "../../hooks/useAdmin";
import { useAdminUsers } from "../../hooks/useAdmin";
import { useAdminWithdrawals } from "../../hooks/useAdmin";
import { useFraudFlags } from "../../hooks/useAdmin";
import { AdminStatCard } from "../../components/admin/AdminShared";
import { ErrorState } from "../../components/ui/States";
import { formatCurrency, formatNumber, formatDate } from "../../lib/formatters";

const PIE_COLORS = ["#22c55e", "#ef4444"];

function ViewsPieChart({ valid, rejected, loading }) {
  if (loading) return <div className="h-48 bg-white/5 rounded-xl animate-pulse" />;
  const total = valid + rejected;
  if (total === 0) return (
    <div className="h-48 flex items-center justify-center text-white/30 text-sm">No view data yet</div>
  );
  const data = [
    { name: "Valid", value: valid },
    { name: "Rejected", value: rejected },
  ];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#aaa" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#aaa" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboard() {
  const analytics = useAdminDashboard();
  const users = useAdminUsers({ page: 1, limit: 1 });
  const withdrawals = useAdminWithdrawals({ status: "PENDING", page: 1, limit: 1 });
  const fraud = useFraudFlags({ resolved: false, page: 1, limit: 1 });

  const d = analytics.data;
  const isLoading = analytics.isLoading;

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Platform overview</p>
      </div>

      {analytics.isError ? (
        <ErrorState message={analytics.error?.message} onRetry={analytics.refetch} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard icon={Eye} label="Total Views" value={formatNumber(d?.totalViews)} color="bg-blue-600" loading={isLoading} />
            <AdminStatCard icon={Eye} label="Valid Views" value={formatNumber(d?.validViews)} color="bg-green-600" loading={isLoading} />
            <AdminStatCard icon={DollarSign} label="Total Earnings" value={formatCurrency(d?.totalEarnings)} color="bg-purple-600" loading={isLoading} />
            <AdminStatCard icon={AlertTriangle} label="Rejected Views" value={formatNumber(d?.rejectedViews)} color="bg-red-600" loading={isLoading} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminStatCard icon={Users} label="Total Users" value={formatNumber(users.data?.total)} color="bg-cyan-600" loading={users.isLoading} />
            <AdminStatCard icon={Clock} label="Pending Withdrawals" value={formatNumber(withdrawals.data?.total)} color="bg-yellow-600" loading={withdrawals.isLoading} />
            <AdminStatCard icon={AlertTriangle} label="Open Fraud Flags" value={formatNumber(Array.isArray(fraud.data) ? fraud.data.length : 0)} color="bg-orange-600" loading={fraud.isLoading} />
          </div>

          {/* Views Breakdown + Top Creators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Views Breakdown</h2>
              <ViewsPieChart valid={d?.validViews ?? 0} rejected={d?.rejectedViews ?? 0} loading={isLoading} />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Top Creators</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />)}
                </div>
              ) : !d?.topCreators?.length ? (
                <p className="text-white/30 text-sm text-center py-8">No earnings data yet</p>
              ) : (
                <div className="space-y-3">
                  {d.topCreators.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-white/30 text-xs w-4 shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.creator?.name ?? "Unknown"}</p>
                          <p className="text-xs text-white/40 truncate">{c.creator?.email}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-green-400">{formatCurrency(c.earnings)}</p>
                        <p className="text-xs text-white/40">{formatNumber(c.validViews)} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

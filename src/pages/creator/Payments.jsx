// src/pages/creator/Payments.jsx
import { DollarSign, TrendingUp, Wallet, ArrowDownCircle } from "lucide-react";
import { useWallet, useTransactions } from "../../hooks/useWallet";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { StatCardSkeleton, TableRowSkeleton } from "../../Components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../Components/ui/States";

function WalletCard({ icon: Icon, label, value, color, loading }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <div className={`rounded-2xl p-6 text-white flex items-start gap-4 ${color}`}>
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-white/70 text-sm">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

function TxTypeBadge({ type }) {
  const map = {
    EARNING:    "bg-green-500/20 text-green-400",
    WITHDRAWAL: "bg-red-500/20 text-red-400",
    BONUS:      "bg-blue-500/20 text-blue-400",
    REFERRAL:   "bg-purple-500/20 text-purple-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[type] ?? "bg-white/10 text-white/50"}`}>
      {type ?? "—"}
    </span>
  );
}

export default function Payments() {
  const wallet = useWallet();
  const transactions = useTransactions();

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-white/40 text-sm mt-1">Your earnings and transaction history</p>
      </div>

      {/* Wallet Cards */}
      {wallet.isError ? (
        <ErrorState message={wallet.error?.message} onRetry={wallet.refetch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <WalletCard
            icon={TrendingUp}
            label="Total Earnings"
            value={formatCurrency(wallet.data?.totalEarnings)}
            color="bg-gradient-to-br from-blue-600 to-blue-800"
            loading={wallet.isLoading}
          />
          <WalletCard
            icon={Wallet}
            label="Available Balance"
            value={formatCurrency(wallet.data?.availableBalance)}
            color="bg-gradient-to-br from-green-600 to-green-800"
            loading={wallet.isLoading}
          />
          <WalletCard
            icon={DollarSign}
            label="Pending Balance"
            value={formatCurrency(wallet.data?.pendingBalance)}
            color="bg-gradient-to-br from-yellow-600 to-yellow-800"
            loading={wallet.isLoading}
          />
          <WalletCard
            icon={ArrowDownCircle}
            label="Total Withdrawn"
            value={formatCurrency(wallet.data?.lifetimeWithdrawn)}
            color="bg-gradient-to-br from-purple-600 to-purple-800"
            loading={wallet.isLoading}
          />
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold">Transaction History</h2>
        </div>

        {transactions.isLoading ? (
          <table className="w-full">
            <tbody>
              {[1, 2, 3].map(i => <TableRowSkeleton key={i} cols={4} />)}
            </tbody>
          </table>
        ) : transactions.isError ? (
          <ErrorState message={transactions.error?.message} onRetry={transactions.refetch} />
        ) : transactions.data?.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={40} />}
            title="No transactions yet"
            description="Earnings will appear here once your videos get views"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.data.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/3 transition">
                    <td className="px-6 py-3"><TxTypeBadge type={tx.type} /></td>
                    <td className={`px-6 py-3 font-medium ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-3 text-white/60">{tx.description ?? "—"}</td>
                    <td className="px-6 py-3 text-white/40">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

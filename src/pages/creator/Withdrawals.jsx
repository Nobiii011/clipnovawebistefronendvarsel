// src/pages/creator/Withdrawals.jsx
// FIX: Old code had broken name attribute: name="{options.method === 'UPI' ? 'upi' : 'paymentId'}"
// (literal string with braces instead of dynamic expression)
// Backend: POST /withdrawals { amount, paymentMethod: { type: "UPI", upiId } }
// Minimum withdrawal: ₹100

import { useState, useCallback } from "react";
import { Wallet, Clock, CheckCircle, XCircle } from "lucide-react";
import { useWallet, useWithdrawals, useRequestWithdrawal } from "../../hooks/useWallet";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { Skeleton, TableRowSkeleton } from "../../Components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../Components/ui/States";
import Toast from "../../Components/ui/Toast";

const PAYMENT_METHODS = ["UPI", "BANK_TRANSFER", "PAYPAL", "PAYONEER"];
const MIN_WITHDRAWAL = 100;

const STATUS_CONFIG = {
  PENDING:   { icon: Clock,         color: "text-yellow-400", bg: "bg-yellow-500/10" },
  APPROVED:  { icon: CheckCircle,   color: "text-green-400",  bg: "bg-green-500/10"  },
  REJECTED:  { icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/10"    },
  PAID:      { icon: CheckCircle,   color: "text-blue-400",   bg: "bg-blue-500/10"   },
};

function WithdrawalStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

export default function Withdrawals() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [confirmUpiId, setConfirmUpiId] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const wallet = useWallet();
  const withdrawals = useWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();

  const availableBalance = wallet.data?.availableBalance ?? 0;

  const validate = useCallback(() => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt)) return "Enter a valid amount.";
    if (amt < MIN_WITHDRAWAL) return `Minimum withdrawal is ₹${MIN_WITHDRAWAL}.`;
    if (amt > availableBalance) return "Amount exceeds available balance.";
    if (method === "UPI") {
      if (!upiId.trim()) return "UPI ID is required.";
      if (upiId !== confirmUpiId) return "UPI IDs do not match.";
      if (!/^[\w.\-]+@[\w]+$/.test(upiId)) return "Invalid UPI ID format.";
    }
    return null;
  }, [amount, method, upiId, confirmUpiId, availableBalance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError("");

    const paymentMethod = { type: method };
    if (method === "UPI") paymentMethod.upiId = upiId.trim();

    try {
      await requestWithdrawal.mutateAsync({
        amount: parseFloat(amount),
        paymentMethod,
      });
      setToast({ type: "success", message: "Withdrawal request submitted!" });
      setAmount("");
      setUpiId("");
      setConfirmUpiId("");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  const isSubmitting = requestWithdrawal.isPending;

  return (
    <div className="space-y-8 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-white/40 text-sm mt-1">Request a payout from your available balance</p>
      </div>

      {/* Balance Summary */}
      {wallet.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : wallet.data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Available Balance", value: formatCurrency(wallet.data.availableBalance), highlight: true },
            { label: "Pending Balance",   value: formatCurrency(wallet.data.pendingBalance) },
            { label: "Total Withdrawn",   value: formatCurrency(wallet.data.lifetimeWithdrawn) },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`rounded-2xl p-5 border ${highlight ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"}`}
            >
              <p className="text-white/50 text-xs">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${highlight ? "text-green-400" : "text-white"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawal Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Request Withdrawal</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Amount (₹) <span className="text-white/30 text-xs">min ₹{MIN_WITHDRAWAL}</span>
              </label>
              <input
                type="number"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min={MIN_WITHDRAWAL}
                max={availableBalance}
                step="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Payment Method</label>
              <select
                name="method"
                value={method}
                onChange={(e) => { setMethod(e.target.value); setUpiId(""); setConfirmUpiId(""); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m} className="bg-neutral-900">{m.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* UPI fields — only shown when method is UPI */}
            {method === "UPI" && (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Confirm UPI ID</label>
                  <input
                    type="text"
                    name="confirmUpiId"
                    value={confirmUpiId}
                    onChange={(e) => setConfirmUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition
                      ${confirmUpiId && upiId !== confirmUpiId ? "border-red-500/50" : "border-white/10 focus:border-white/30"}`}
                  />
                </div>
              </>
            )}
          </div>

          {formError && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <XCircle size={14} /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || availableBalance < MIN_WITHDRAWAL}
            className="px-8 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wallet size={16} /> Request Withdrawal
              </>
            )}
          </button>

          {availableBalance < MIN_WITHDRAWAL && !wallet.isLoading && (
            <p className="text-white/30 text-xs">
              You need at least ₹{MIN_WITHDRAWAL} available to withdraw.
            </p>
          )}
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold">Withdrawal History</h2>
        </div>

        {withdrawals.isLoading ? (
          <table className="w-full">
            <tbody>{[1, 2, 3].map(i => <TableRowSkeleton key={i} cols={4} />)}</tbody>
          </table>
        ) : withdrawals.isError ? (
          <ErrorState message={withdrawals.error?.message} onRetry={withdrawals.refetch} />
        ) : withdrawals.data?.length === 0 ? (
          <EmptyState
            icon={<Wallet size={40} />}
            title="No withdrawals yet"
            description="Your withdrawal requests will appear here"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Method</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.data.map((w) => (
                  <tr key={w._id} className="hover:bg-white/3 transition">
                    <td className="px-6 py-3 font-medium">{formatCurrency(w.amount)}</td>
                    <td className="px-6 py-3 text-white/60">{w.paymentMethod?.type ?? "—"}</td>
                    <td className="px-6 py-3"><WithdrawalStatusBadge status={w.status} /></td>
                    <td className="px-6 py-3 text-white/40">{formatDate(w.createdAt)}</td>
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

// src/services/wallet.service.js
// Backend reality:
// GET  /wallet                → { data: { totalEarnings, availableBalance, pendingBalance, lifetimeWithdrawn } }
// GET  /wallet/transactions   → { data: Transaction[] }
// GET  /withdrawals           → { data: Withdrawal[] }
// POST /withdrawals           → { amount (min 100), paymentMethod: { type: "UPI", upiId } }

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

export async function getWallet() {
  try {
    const { data } = await apiClient.get("/wallet");
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTransactions(params = {}) {
  try {
    const { data } = await apiClient.get("/wallet/transactions", { params });
    return data.data ?? [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getWithdrawals() {
  try {
    const { data } = await apiClient.get("/withdrawals");
    return data.data ?? [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function requestWithdrawal(amount, paymentMethod) {
  // paymentMethod: { type: "UPI", upiId: "..." }
  // Minimum withdrawal: ₹100
  try {
    const { data } = await apiClient.post("/withdrawals", { amount, paymentMethod });
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

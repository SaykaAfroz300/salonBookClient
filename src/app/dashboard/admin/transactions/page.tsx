"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { TransactionRecord } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<{
          success: boolean;
          data: TransactionRecord[];
        }>("/api/transactions", { auth: true });
        if (active) setTransactions(res.data || []);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load payment transactions.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading payment transactions..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
          Payment Transactions
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6e655f]">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Read-only ledger automatically recorded from verified Stripe webhook
          events.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-12 text-center text-sm text-[#6e655f]">
          No payment transactions have been recorded yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8dfd6] bg-[#faf7f2] text-xs uppercase tracking-wider text-[#6e655f]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Appointment Date</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Stripe Session</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eae3]">
                {transactions.map((tx) => {
                  const apt =
                    typeof tx.appointmentId === "object"
                      ? tx.appointmentId
                      : null;
                  return (
                    <tr key={tx._id} className="hover:bg-[#faf7f2]/60">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1f1a17]">
                          {tx.customer?.name || "Customer"}
                        </p>
                        <p className="text-xs text-[#6e655f]">
                          {tx.customer?.email || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-[#1f1a17]">
                        {apt?.serviceId?.serviceName || "Salon Service"}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#6e655f] whitespace-nowrap">
                        {apt?.appointmentDate
                          ? `${apt.appointmentDate} · ${apt.timeSlot}`
                          : "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#1f1a17] whitespace-nowrap">
                        {formatCurrency(tx.amount, tx.currency)}{" "}
                        <span className="text-[11px] font-normal uppercase text-[#6e655f]">
                          {tx.currency}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#6e655f]">
                        {tx.stripeSessionId.length > 20
                          ? `${tx.stripeSessionId.slice(0, 12)}...${tx.stripeSessionId.slice(-6)}`
                          : tx.stripeSessionId}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-[#6e655f] whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

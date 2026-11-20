"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/constants";
import type { TransactionRecord } from "@/types";
import { PageLoader } from "@/components/Loader";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [transaction, setTransaction] = useState<TransactionRecord | null>(
    null
  );

  useEffect(() => {
    if (!sessionId) {
      setChecking(false);
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    async function checkPaymentStatus() {
      try {
        const res = await apiFetch<{
          success: boolean;
          data: {
            verified: boolean;
            pendingWebhook?: boolean;
            transaction: TransactionRecord | null;
          };
        }>(`/api/payments/session/${sessionId}`, { auth: true });

        if (!active) return;

        if (res.data?.verified && res.data.transaction) {
          setVerified(true);
          setTransaction(res.data.transaction);
          setChecking(false);
          return;
        }

        attempts += 1;
        if (attempts < 5) {
          timer = setTimeout(checkPaymentStatus, 2000);
        } else {
          setChecking(false);
        }
      } catch {
        if (active) setChecking(false);
      }
    }

    checkPaymentStatus();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const aptInfo =
    transaction && typeof transaction.appointmentId === "object"
      ? transaction.appointmentId
      : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl border border-[#e8dfd6] bg-white p-10 shadow-sm">
        {checking ? (
          <div className="py-6">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#b5654d]" />
            <h1 className="font-display mt-5 text-3xl font-semibold text-[#1f1a17]">
              Verifying Your Payment...
            </h1>
            <p className="mt-2 text-sm text-[#6e655f]">
              Waiting for Stripe webhook confirmation to finalize your booking.
            </p>
          </div>
        ) : verified && transaction ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="font-display mt-5 text-4xl font-semibold text-[#1f1a17]">
              Payment Confirmed!
            </h1>
            <p className="mt-2 text-sm text-[#6e655f]">
              Thank you! Your salon appointment payment has been verified and
              recorded.
            </p>

            <div className="mt-6 space-y-2.5 rounded-2xl bg-[#faf7f2] p-5 text-left text-sm">
              {aptInfo?.serviceId?.serviceName && (
                <div className="flex justify-between">
                  <span className="text-[#6e655f]">Service</span>
                  <span className="font-semibold text-[#1f1a17]">
                    {aptInfo.serviceId.serviceName}
                  </span>
                </div>
              )}
              {aptInfo?.appointmentDate && (
                <div className="flex justify-between">
                  <span className="text-[#6e655f]">Date &amp; Time</span>
                  <span className="font-semibold text-[#1f1a17]">
                    {aptInfo.appointmentDate} · {aptInfo.timeSlot}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Amount Paid</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Reference</span>
                <span className="font-mono text-xs text-[#1f1a17]">
                  {transaction.stripeSessionId.slice(0, 22)}...
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-8 w-8" />
            </span>
            <h1 className="font-display mt-5 text-3xl font-semibold text-[#1f1a17]">
              Payment Received — Finalizing
            </h1>
            <p className="mt-2 text-sm text-[#6e655f]">
              Your checkout succeeded. Your appointment payment status will
              update automatically as soon as the Stripe webhook is delivered.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/customer/appointments"
            className="rounded-full bg-[#1f1a17] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
          >
            View My Appointments
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-[#e8dfd6] px-6 py-3 text-sm font-semibold text-[#1f1a17] transition hover:bg-[#faf7f2]"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading payment details..." />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

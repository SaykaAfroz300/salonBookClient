"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { AppointmentRecord } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function CustomerAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<AppointmentRecord | null>(
    null
  );
  const [cancelTarget, setCancelTarget] = useState<AppointmentRecord | null>(
    null
  );
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: AppointmentRecord[];
      }>("/api/appointments/my", { auth: true });
      setAppointments(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/appointments/${cancelTarget._id}/cancel`, {
        method: "PATCH",
        auth: true,
      });
      toast.success("Appointment request cancelled.");
      setCancelTarget(null);
      loadAppointments();
    } catch (err: any) {
      toast.error(err?.message || "Could not cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async (appointmentId: string) => {
    setPayingId(appointmentId);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { url: string; sessionId: string };
      }>("/api/payments/create-checkout-session", {
        method: "POST",
        auth: true,
        body: { appointmentId },
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Could not initialize Stripe checkout.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to start payment session.");
      setPayingId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your appointments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            My Appointments
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            Manage your appointment requests, cancel pending slots, and pay for
            confirmed bookings via Stripe.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
        >
          Book Another Service
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-14 text-center">
          <h3 className="font-display text-2xl font-semibold text-[#1f1a17]">
            No appointments yet
          </h3>
          <p className="mt-2 text-sm text-[#6e655f]">
            Explore our salon services and submit your first booking request.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-block rounded-full bg-[#b5654d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#964e39]"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8dfd6] bg-[#faf7f2] text-xs uppercase tracking-wider text-[#6e655f]">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Requested On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eae3]">
                {appointments.map((apt) => {
                  const service =
                    typeof apt.serviceId === "object" ? apt.serviceId : null;
                  const canCancel = apt.status === "pending";
                  const canPay =
                    apt.status === "confirmed" &&
                    apt.paymentStatus === "unpaid";

                  return (
                    <tr key={apt._id} className="hover:bg-[#faf7f2]/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {service?.image && (
                            <img
                              src={service.image}
                              alt={service.serviceName}
                              className="h-11 w-11 shrink-0 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-[#1f1a17]">
                              {service?.serviceName || "Salon Service"}
                            </p>
                            <p className="text-xs text-[#6e655f]">
                              {service?.category || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#1f1a17]">
                          {apt.appointmentDate}
                        </p>
                        <p className="text-xs text-[#6e655f]">{apt.timeSlot}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#1f1a17] whitespace-nowrap">
                        {formatCurrency(apt.servicePrice)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={apt.paymentStatus} />
                      </td>
                      <td className="px-5 py-4 text-xs text-[#6e655f] whitespace-nowrap">
                        {formatDate(apt.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApt(apt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#e8dfd6] px-2.5 py-1.5 text-xs font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(apt)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}

                          {canPay && (
                            <button
                              type="button"
                              disabled={payingId === apt._id}
                              onClick={() => handlePayNow(apt._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#b5654d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#964e39] disabled:opacity-60"
                            >
                              {payingId === apt._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CreditCard className="h-3.5 w-3.5" />
                              )}
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f4eae3] pb-3">
              <h3 className="font-display text-2xl font-semibold text-[#1f1a17]">
                Appointment Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="rounded-lg p-1 text-[#6e655f] hover:bg-[#faf7f2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Service</span>
                <span className="font-semibold text-[#1f1a17]">
                  {typeof selectedApt.serviceId === "object"
                    ? selectedApt.serviceId.serviceName
                    : "Salon Service"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Category</span>
                <span className="text-[#1f1a17]">
                  {typeof selectedApt.serviceId === "object"
                    ? selectedApt.serviceId.category
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Date &amp; Time</span>
                <span className="font-medium text-[#1f1a17]">
                  {selectedApt.appointmentDate} at {selectedApt.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Price</span>
                <span className="font-bold text-[#b5654d]">
                  {formatCurrency(selectedApt.servicePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Appointment Status</span>
                <StatusBadge status={selectedApt.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Payment Status</span>
                <StatusBadge status={selectedApt.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Requested On</span>
                <span className="text-[#1f1a17]">
                  {formatDate(selectedApt.createdAt)}
                </span>
              </div>
              {selectedApt.message && (
                <div className="rounded-xl bg-[#faf7f2] p-3">
                  <p className="text-xs font-semibold uppercase text-[#6e655f]">
                    Your Note
                  </p>
                  <p className="mt-1 text-sm text-[#1f1a17]">
                    {selectedApt.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Appointment Request?"
        description="Are you sure you want to cancel this pending appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel Request"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

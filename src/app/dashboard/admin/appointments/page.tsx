"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Eye, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { AppointmentRecord } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApt, setSelectedApt] = useState<AppointmentRecord | null>(
    null
  );
  const [actionTarget, setActionTarget] = useState<{
    apt: AppointmentRecord;
    nextStatus: "confirmed" | "cancelled";
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await apiFetch<{
        success: boolean;
        data: AppointmentRecord[];
      }>(`/api/appointments${query}`, { auth: true });
      setAppointments(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load appointment requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    setUpdating(true);
    try {
      await apiFetch(`/api/appointments/${actionTarget.apt._id}/status`, {
        method: "PATCH",
        auth: true,
        body: { status: actionTarget.nextStatus },
      });
      toast.success(`Appointment ${actionTarget.nextStatus} successfully.`);
      setActionTarget(null);
      loadAppointments();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update appointment status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            Manage Appointments
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            Review customer appointment requests, confirm pending bookings, or
            cancel appointments.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#e8dfd6] bg-white px-4 py-2 text-sm font-medium text-[#1f1a17] focus:border-[#b5654d] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <PageLoader label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-12 text-center text-sm text-[#6e655f]">
          No appointment requests match this filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8dfd6] bg-[#faf7f2] text-xs uppercase tracking-wider text-[#6e655f]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eae3]">
                {appointments.map((apt) => {
                  const service =
                    typeof apt.serviceId === "object" ? apt.serviceId : null;
                  const canConfirm = apt.status === "pending";
                  const canCancel =
                    (apt.status === "pending" || apt.status === "confirmed") &&
                    apt.paymentStatus !== "paid";

                  return (
                    <tr key={apt._id} className="hover:bg-[#faf7f2]/60">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1f1a17]">
                          {apt.customer?.name || "Customer"}
                        </p>
                        <p className="text-xs text-[#6e655f]">
                          {apt.customer?.email || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#1f1a17]">
                          {service?.serviceName || "Salon Service"}
                        </p>
                        <p className="text-xs text-[#6e655f]">
                          {service?.category || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#1f1a17]">
                          {apt.appointmentDate}
                        </p>
                        <p className="text-xs text-[#6e655f]">{apt.timeSlot}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#1f1a17]">
                        {formatCurrency(apt.servicePrice)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={apt.paymentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApt(apt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#e8dfd6] px-2.5 py-1.5 text-xs font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>

                          {canConfirm && (
                            <button
                              type="button"
                              onClick={() =>
                                setActionTarget({
                                  apt,
                                  nextStatus: "confirmed",
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirm
                            </button>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() =>
                                setActionTarget({
                                  apt,
                                  nextStatus: "cancelled",
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
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
                Appointment Request Details
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
                <span className="text-[#6e655f]">Customer</span>
                <span className="font-semibold text-[#1f1a17]">
                  {selectedApt.customer?.name} ({selectedApt.customer?.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Service</span>
                <span className="font-semibold text-[#1f1a17]">
                  {typeof selectedApt.serviceId === "object"
                    ? selectedApt.serviceId.serviceName
                    : "Salon Service"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Appointment Slot</span>
                <span className="font-medium text-[#1f1a17]">
                  {selectedApt.appointmentDate} · {selectedApt.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Price</span>
                <span className="font-bold text-[#b5654d]">
                  {formatCurrency(selectedApt.servicePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Status</span>
                <StatusBadge status={selectedApt.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Payment</span>
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
                    Customer Message
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

      <ConfirmDialog
        open={Boolean(actionTarget)}
        title={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirm Appointment?"
            : "Cancel Appointment?"
        }
        description={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirming this appointment allows the customer to proceed with Stripe payment."
            : "Are you sure you want to cancel this appointment request?"
        }
        confirmLabel={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirm Appointment"
            : "Cancel Appointment"
        }
        variant={
          actionTarget?.nextStatus === "confirmed" ? "primary" : "danger"
        }
        loading={updating}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionTarget(null)}
      />
    </div>
  );
}

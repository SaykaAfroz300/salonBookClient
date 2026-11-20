"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatCurrency, TIME_SLOTS } from "@/lib/constants";
import type { SalonService } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";

export default function ServiceDetailsPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<SalonService | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Protect Service Details Page
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }
    if (user.isBlocked) {
      router.replace("/blocked");
    }
  }, [authLoading, user, router, id]);

  // Fetch service details
  useEffect(() => {
    if (authLoading || !user || user.isBlocked || !id) return;
    let active = true;
    async function loadService() {
      setLoadingService(true);
      setErrorMessage(null);
      try {
        const res = await apiFetch<{ success: boolean; data: SalonService }>(
          `/api/services/${id}`
        );
        if (active) setService(res.data);
      } catch (err: any) {
        if (active) {
          setErrorMessage(
            err?.message || "Invalid service ID or service could not be found."
          );
        }
      } finally {
        if (active) setLoadingService(false);
      }
    }
    loadService();
    return () => {
      active = false;
    };
  }, [authLoading, user, id]);

  // Fetch already booked slots whenever date changes
  useEffect(() => {
    if (!showBookingForm || !appointmentDate || !user || user.role !== "customer")
      return;
    let active = true;
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await apiFetch<{
          success: boolean;
          data: { bookedSlots: string[] };
        }>(`/api/appointments/booked-slots?date=${appointmentDate}`, {
          auth: true,
        });
        if (active) {
          const taken = res.data?.bookedSlots || [];
          setBookedSlots(taken);
          if (taken.includes(timeSlot)) {
            setTimeSlot("");
          }
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      active = false;
    };
  }, [showBookingForm, appointmentDate, user]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    if (!appointmentDate) {
      toast.error("Please select an appointment date.");
      return;
    }
    if (!timeSlot) {
      toast.error("Please select an available time slot.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        auth: true,
        body: {
          serviceId: service._id,
          appointmentDate,
          timeSlot,
          message,
        },
      });
      toast.success(
        "Appointment request submitted! Track its status in My Appointments."
      );
      router.push("/dashboard/customer/appointments");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit appointment request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!user && !errorMessage)) {
    return <PageLoader label="Verifying your session..." />;
  }

  if (loadingService) {
    return <PageLoader label="Loading salon service details..." />;
  }

  if (errorMessage || !service) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-[#e8dfd6] bg-white p-10 shadow-xs">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h1 className="font-display mt-4 text-3xl font-semibold text-[#1f1a17]">
            Service Not Found
          </h1>
          <p className="mt-2 text-sm text-[#6e655f]">
            {errorMessage || "The requested salon service is not available."}
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#b5654d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const isActive = service.status === "active";
  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6e655f] transition hover:text-[#b5654d]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Service Image */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-3xl border border-[#e8dfd6] bg-[#f4eae3] shadow-xs">
            <img
              src={service.image}
              alt={service.serviceName}
              className="h-[380px] w-full object-cover sm:h-[460px]"
            />
          </div>
        </div>

        {/* Service Details & Booking Panel */}
        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#f4eae3] px-3.5 py-1 text-xs font-semibold text-[#b5654d]">
              {service.category}
            </span>
            <StatusBadge status={service.status} />
          </div>

          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight text-[#1f1a17]">
            {service.serviceName}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-6 border-y border-[#e8dfd6] py-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6e655f]">
                Price
              </p>
              <p className="mt-0.5 text-2xl font-bold text-[#b5654d]">
                {formatCurrency(service.price)}
              </p>
            </div>
            <div className="h-9 w-px bg-[#e8dfd6]" />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6e655f]">
                Estimated Duration
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold text-[#1f1a17]">
                <Clock className="h-4 w-4 text-[#b5654d]" />
                {service.duration} minutes
              </p>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1f1a17]">
              About This Treatment
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6e655f]">
              {service.description}
            </p>
          </div>

          {/* Booking Rules & Action */}
          <div className="mt-8">
            {!isActive ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">Service Currently Unavailable</p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    Only active salon services are available for online
                    appointment booking.
                  </p>
                </div>
              </div>
            ) : isAdmin ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#e8dfd6] bg-[#f4eae3]/60 p-4 text-sm text-[#1f1a17]">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#b5654d]" />
                <div>
                  <p className="font-semibold">Administrator View</p>
                  <p className="mt-0.5 text-xs text-[#6e655f]">
                    Administrators cannot submit customer appointment requests.
                    You can manage this service from the{" "}
                    <Link
                      href="/dashboard/admin/services"
                      className="font-semibold text-[#b5654d] underline"
                    >
                      Admin Dashboard
                    </Link>
                    .
                  </p>
                </div>
              </div>
            ) : !showBookingForm ? (
              <button
                type="button"
                onClick={() => setShowBookingForm(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1a17] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b5654d]"
              >
                <Sparkles className="h-4 w-4" />
                Book This Appointment
              </button>
            ) : (
              <form
                onSubmit={handleBookAppointment}
                className="rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold text-[#1f1a17]">
                    Request Appointment
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="text-xs font-medium text-[#6e655f] hover:text-[#1f1a17]"
                  >
                    Cancel
                  </button>
                </div>

                {/* Date Picker */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
                    Appointment Date
                  </label>
                  <div className="relative mt-1.5">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
                    <input
                      type="date"
                      min={todayStr}
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
                      Available Time Slot
                    </label>
                    {loadingSlots && (
                      <span className="text-xs text-[#6e655f]">
                        Checking availability...
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setTimeSlot(slot)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            isBooked
                              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through"
                              : isSelected
                              ? "border-[#b5654d] bg-[#b5654d] text-white"
                              : "border-[#e8dfd6] bg-[#faf7f2] text-[#1f1a17] hover:border-[#b5654d]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Message */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any preferences, stylist requests, or sensitivities..."
                    className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] p-3 text-sm text-[#1f1a17] placeholder:text-[#6e655f] focus:border-[#b5654d] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !timeSlot}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b5654d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#964e39] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Appointment Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

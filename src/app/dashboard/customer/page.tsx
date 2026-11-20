"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/constants";
import type { CustomerDashboardData } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerOverviewPage() {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<{
          success: boolean;
          data: CustomerDashboardData;
        }>("/api/dashboard/customer", { auth: true });
        if (active) setData(res.data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load dashboard overview.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading overview..." />;

  const stats = data?.stats || {
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
  };

  const statCards = [
    {
      label: "Total Requests",
      value: stats.totalAppointments,
      icon: CalendarClock,
      accent: "bg-[#f4eae3] text-[#b5654d]",
    },
    {
      label: "Pending",
      value: stats.pendingAppointments,
      icon: Clock,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Confirmed",
      value: stats.confirmedAppointments,
      icon: CalendarCheck,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Cancelled",
      value: stats.cancelledAppointments,
      icon: XCircle,
      accent: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            Track your upcoming salon appointments and payment status at a
            glance.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
        >
          Book New Service
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-[#e8dfd6] bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
                  {card.label}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#1f1a17]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Appointments */}
      <div className="rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-[#1f1a17]">
            Recent Appointments
          </h2>
          <Link
            href="/dashboard/customer/appointments"
            className="text-xs font-semibold text-[#b5654d] hover:underline"
          >
            View All
          </Link>
        </div>

        {data?.recentAppointments?.length ? (
          <div className="mt-5 divide-y divide-[#f4eae3]">
            {data.recentAppointments.map((apt) => {
              const service =
                typeof apt.serviceId === "object" ? apt.serviceId : null;
              return (
                <div
                  key={apt._id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    {service?.image && (
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#1f1a17]">
                        {service?.serviceName || "Salon Service"}
                      </p>
                      <p className="text-xs text-[#6e655f]">
                        {apt.appointmentDate} · {apt.timeSlot} ·{" "}
                        {formatCurrency(apt.servicePrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <StatusBadge status={apt.paymentStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-[#faf7f2] p-8 text-center">
            <p className="text-sm text-[#6e655f]">
              You haven&apos;t requested any appointments yet.
            </p>
            <Link
              href="/services"
              className="mt-3 inline-block text-sm font-semibold text-[#b5654d] hover:underline"
            >
              Explore Salon Services →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

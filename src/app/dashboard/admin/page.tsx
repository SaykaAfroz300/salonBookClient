"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  Clock,
  CreditCard,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/constants";
import type { AdminDashboardData } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<{
          success: boolean;
          data: AdminDashboardData;
        }>("/api/dashboard/admin", { auth: true });
        if (active) setData(res.data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load admin overview.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading admin overview..." />;

  const stats = data?.stats || {
    totalCustomers: 0,
    totalActiveServices: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    totalSuccessfulPayments: 0,
    totalRevenue: 0,
  };

  const statCards = [
    {
      label: "Registered Customers",
      value: stats.totalCustomers,
      icon: Users,
      accent: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Active Services",
      value: stats.totalActiveServices,
      icon: Sparkles,
      accent: "bg-[#f4eae3] text-[#b5654d]",
    },
    {
      label: "Total Appointments",
      value: stats.totalAppointments,
      icon: CalendarClock,
      accent: "bg-stone-100 text-[#1f1a17]",
    },
    {
      label: "Pending Requests",
      value: stats.pendingAppointments,
      icon: Clock,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Confirmed Bookings",
      value: stats.confirmedAppointments,
      icon: CalendarCheck,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Successful Payments",
      value: `${stats.totalSuccessfulPayments} (${formatCurrency(
        stats.totalRevenue
      )})`,
      icon: CreditCard,
      accent: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            Salon Overview
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            Monitor customers, services, appointment requests, and verified
            Stripe payments.
          </p>
        </div>
        <Link
          href="/dashboard/admin/services/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </Link>
      </div>

      {/* 6 Required Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              <p className="mt-3 text-2xl font-bold text-[#1f1a17]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Appointment Requests */}
      <div className="rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-[#1f1a17]">
            Recent Appointment Requests
          </h2>
          <Link
            href="/dashboard/admin/appointments"
            className="text-xs font-semibold text-[#b5654d] hover:underline"
          >
            Manage All
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
                  <div>
                    <p className="text-sm font-semibold text-[#1f1a17]">
                      {service?.serviceName || "Salon Service"}{" "}
                      <span className="font-normal text-[#6e655f]">
                        — {apt.customer?.name || "Customer"}
                      </span>
                    </p>
                    <p className="text-xs text-[#6e655f]">
                      {apt.appointmentDate} · {apt.timeSlot} ·{" "}
                      {formatCurrency(apt.servicePrice)}
                    </p>
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
          <p className="mt-6 text-center text-sm text-[#6e655f]">
            No appointment requests yet.
          </p>
        )}
      </div>
    </div>
  );
}

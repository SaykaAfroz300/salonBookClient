"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatCurrency, SERVICE_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function AdminServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<SalonService | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "All") params.set("category", category);

      const res = await apiFetch<{ success: boolean; data: SalonService[] }>(
        `/api/services/admin/all?${params.toString()}`,
        { auth: true }
      );
      setServices(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load salon services.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(loadServices, 250);
    return () => clearTimeout(timer);
  }, [loadServices]);

  const handleToggleStatus = async (service: SalonService) => {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    setTogglingId(service._id);
    try {
      await apiFetch(`/api/services/${service._id}`, {
        method: "PATCH",
        auth: true,
        body: { status: nextStatus },
      });
      toast.success(
        `Service ${nextStatus === "active" ? "activated" : "deactivated"}.`
      );
      loadServices();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update service status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/services/${deleteTarget._id}`, {
        method: "DELETE",
        auth: true,
      });
      toast.success("Salon service deleted.");
      setDeleteTarget(null);
      loadServices();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete service.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            Manage Services
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            Add, edit, activate/deactivate, or remove salon services. Only active
            services appear publicly.
          </p>
        </div>
        <Link
          href="/dashboard/admin/services/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </Link>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-[#e8dfd6] bg-white p-4 shadow-xs sm:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name..."
            className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
        >
          <option value="All">All Categories</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader label="Loading salon services..." />
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-12 text-center">
          <p className="text-sm text-[#6e655f]">No salon services found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8dfd6] bg-[#faf7f2] text-xs uppercase tracking-wider text-[#6e655f]">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eae3]">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-[#faf7f2]/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={service.image}
                          alt={service.serviceName}
                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                        />
                        <span className="font-semibold text-[#1f1a17]">
                          {service.serviceName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6e655f]">
                      {service.category}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#1f1a17]">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6e655f]">
                      {service.duration} mins
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={service.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={togglingId === service._id}
                          onClick={() => handleToggleStatus(service)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#e8dfd6] px-2.5 py-1.5 text-xs font-medium text-[#1f1a17] hover:bg-[#faf7f2] disabled:opacity-50"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {service.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                        <Link
                          href={`/dashboard/admin/services/${service._id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#e8dfd6] px-2.5 py-1.5 text-xs font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(service)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Salon Service?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.serviceName}"?`}
        confirmLabel="Delete Service"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

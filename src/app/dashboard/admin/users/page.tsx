"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Eye,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/constants";
import type { UserProfile } from "@/types";
import { PageLoader } from "@/components/Loader";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserProfile | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = search.trim()
        ? `?search=${encodeURIComponent(search.trim())}`
        : "";
      const res = await apiFetch<{ success: boolean; data: UserProfile[] }>(
        `/api/users${query}`,
        { auth: true }
      );
      setUsers(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load registered customers.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 250);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleConfirmBlockToggle = async () => {
    if (!blockTarget) return;
    setUpdating(true);
    try {
      const nextBlocked = !blockTarget.isBlocked;
      await apiFetch(`/api/users/${blockTarget.id}/block`, {
        method: "PATCH",
        auth: true,
        body: { isBlocked: nextBlocked },
      });
      toast.success(
        nextBlocked
          ? `${blockTarget.name} has been blocked.`
          : `${blockTarget.name} has been unblocked.`
      );
      setBlockTarget(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user access status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
            Manage Customers
          </h1>
          <p className="mt-1 text-sm text-[#6e655f]">
            View registered salon customers and manage account access.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-[#e8dfd6] bg-white py-2 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading registered customers..." />
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-12 text-center text-sm text-[#6e655f]">
          No registered customers found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8dfd6] bg-[#faf7f2] text-xs uppercase tracking-wider text-[#6e655f]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Appointments</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eae3]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#faf7f2]/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eae3] text-[#b5654d]">
                            <UserIcon className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-[#1f1a17]">
                            {u.name}
                          </p>
                          <p className="text-xs text-[#6e655f]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6e655f]">
                      {u.phone || "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#1f1a17]">
                      {u.appointmentCount ?? 0}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6e655f]">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={u.isBlocked ? "blocked" : "active"}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#e8dfd6] px-2.5 py-1.5 text-xs font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlockTarget(u)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            u.isBlocked
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Block
                            </>
                          )}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f4eae3] pb-3">
              <h3 className="font-display text-2xl font-semibold text-[#1f1a17]">
                Customer Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-[#6e655f] hover:bg-[#faf7f2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Name</span>
                <span className="font-semibold text-[#1f1a17]">
                  {selectedUser.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Email</span>
                <span className="text-[#1f1a17]">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Phone</span>
                <span className="text-[#1f1a17]">
                  {selectedUser.phone || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Total Bookings</span>
                <span className="font-semibold text-[#1f1a17]">
                  {selectedUser.appointmentCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Account Status</span>
                <StatusBadge
                  status={selectedUser.isBlocked ? "blocked" : "active"}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e655f]">Registered</span>
                <span className="text-[#1f1a17]">
                  {formatDate(selectedUser.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title={
          blockTarget?.isBlocked
            ? "Unblock Customer Account?"
            : "Block Customer Account?"
        }
        description={
          blockTarget?.isBlocked
            ? `Unblocking ${blockTarget?.name} will restore their access to booking and dashboard features.`
            : `Blocking ${blockTarget?.name} will immediately prevent them from accessing protected platform features.`
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock User" : "Block User"}
        variant={blockTarget?.isBlocked ? "primary" : "danger"}
        loading={updating}
        onConfirm={handleConfirmBlockToggle}
        onCancel={() => setBlockTarget(null)}
      />
    </div>
  );
}

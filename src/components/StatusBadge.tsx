import React from "react";

const STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-800 ring-rose-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  unpaid: "bg-stone-100 text-stone-700 ring-stone-200",
  failed: "bg-rose-50 text-rose-800 ring-rose-200",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  inactive: "bg-stone-100 text-stone-600 ring-stone-200",
  blocked: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = STYLES[key] || "bg-stone-100 text-stone-700 ring-stone-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}

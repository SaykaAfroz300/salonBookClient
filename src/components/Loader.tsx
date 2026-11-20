import React from "react";
import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-[#b5654d]" />
      <p className="text-sm font-medium text-[#6e655f]">{label}</p>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white"
        >
          <div className="h-52 w-full animate-pulse bg-[#f4eae3]" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#f4eae3]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#f4eae3]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#f4eae3]" />
            <div className="h-10 w-full animate-pulse rounded-full bg-[#f4eae3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

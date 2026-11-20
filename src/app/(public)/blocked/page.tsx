"use client";

import React from "react";
import Link from "next/link";
import { Ban, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function BlockedPage() {
  const { logout } = useAuth();

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-3xl border border-rose-200 bg-white p-10 shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Ban className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-5 text-3xl font-semibold text-[#1f1a17]">
          Account Access Restricted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6e655f]">
          Your account has been blocked by a SalonBook administrator. Protected
          booking and dashboard features are currently unavailable. Please
          contact salon support if you believe this is a mistake.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-[#e8dfd6] px-5 py-2.5 text-sm font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
          >
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

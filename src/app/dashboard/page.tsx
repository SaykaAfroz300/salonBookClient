"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

export default function DashboardRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in?callbackUrl=/dashboard");
    } else if (user.isBlocked) {
      router.replace("/blocked");
    } else if (user.role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <PageLoader label="Redirecting to your dashboard..." />
    </div>
  );
}

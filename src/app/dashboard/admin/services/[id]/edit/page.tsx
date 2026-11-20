"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { SalonService } from "@/types";
import { PageLoader } from "@/components/Loader";
import { ServiceForm } from "@/components/ServiceForm";

export default function EditServicePage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [service, setService] = useState<SalonService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<{ success: boolean; data: SalonService }>(
          `/api/services/${id}`
        );
        if (active) setService(res.data);
      } catch (err: any) {
        toast.error(err?.message || "Could not load service for editing.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <PageLoader label="Loading service details..." />;
  if (!service) {
    return (
      <div className="rounded-2xl border border-[#e8dfd6] bg-white p-8 text-center text-sm text-[#6e655f]">
        Salon service not found.
      </div>
    );
  }

  return <ServiceForm mode="edit" initialData={service} />;
}

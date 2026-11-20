"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, uploadImageToImgBB } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

interface ServiceFormProps {
  mode: "create" | "edit";
  initialData?: SalonService;
}

export function ServiceForm({ mode, initialData }: ServiceFormProps) {
  const router = useRouter();
  const [serviceName, setServiceName] = useState(
    initialData?.serviceName || ""
  );
  const [category, setCategory] = useState(
    initialData?.category || SERVICE_CATEGORIES[0]
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(
    initialData?.price ? String(initialData.price) : ""
  );
  const [duration, setDuration] = useState(
    initialData?.duration ? String(initialData.duration) : ""
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    initialData?.status || "active"
  );
  const [image, setImage] = useState(initialData?.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setImage(uploadedUrl);
      toast.success("Service image uploaded to ImgBB.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload service image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = Number(price);
    const parsedDuration = Number(duration);

    if (!serviceName.trim() || !description.trim()) {
      toast.error("Service name and description are required.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      toast.error("Estimated duration must be a positive number.");
      return;
    }
    if (!image) {
      toast.error("Please upload a service image before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        serviceName: serviceName.trim(),
        category,
        description: description.trim(),
        price: parsedPrice,
        duration: Math.round(parsedDuration),
        image,
        status,
      };

      if (mode === "create") {
        await apiFetch("/api/services", {
          method: "POST",
          auth: true,
          body: payload,
        });
        toast.success("Salon service created successfully!");
      } else if (initialData?._id) {
        await apiFetch(`/api/services/${initialData._id}`, {
          method: "PATCH",
          auth: true,
          body: payload,
        });
        toast.success("Salon service updated successfully!");
      }

      router.push("/dashboard/admin/services");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e655f] hover:text-[#b5654d]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Manage Services
        </Link>
        <h1 className="font-display mt-2 text-3xl font-semibold text-[#1f1a17]">
          {mode === "create" ? "Add New Salon Service" : "Update Salon Service"}
        </h1>
        <p className="mt-1 text-sm text-[#6e655f]">
          Configure service details, pricing, duration, and upload a high-quality
          service image.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xs sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Service Name
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Signature Precision Haircut & Blowout"
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Service Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Service Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "inactive")
              }
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            >
              <option value="active">Active (Visible &amp; Bookable)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Price (USD)
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="65.00"
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Estimated Duration (Minutes)
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is included in this salon treatment..."
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] p-3.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Service Image Upload ONLY (No URL input per requirement) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Service Image (Upload via ImgBB)
            </label>

            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d6c9bc] bg-[#faf7f2] px-6 py-6 text-center transition hover:border-[#b5654d]">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[#b5654d]" />
                  <span className="text-sm font-medium text-[#1f1a17]">
                    Uploading image to ImgBB...
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#b5654d] shadow-xs">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-[#1f1a17]">
                    {image
                      ? "Click to replace service image"
                      : "Click to upload service image"}
                  </span>
                  <span className="text-xs text-[#6e655f]">
                    PNG, JPG, or WEBP up to 5 MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {image && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8dfd6] bg-[#faf7f2]">
                <img
                  src={image}
                  alt="Service preview"
                  className="h-52 w-full object-cover"
                />
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-700">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Service image uploaded and ready.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#f4eae3] pt-5">
          <Link
            href="/dashboard/admin/services"
            className="rounded-full border border-[#e8dfd6] px-5 py-2.5 text-sm font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create Service" : "Update Service"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

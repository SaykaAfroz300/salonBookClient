"use client";

import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Link2,
  Loader2,
  Phone,
  Save,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, uploadImageToImgBB } from "@/lib/api";

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      setImage(url);
      toast.success("Profile photo uploaded.");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        auth: true,
        body: {
          name: name.trim(),
          phone: phone.trim(),
          image: image.trim(),
        },
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[#1f1a17]">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-[#6e655f]">
          Update your personal details and profile picture.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-[#e8dfd6] bg-white p-6 shadow-xs sm:p-8"
      >
        {/* Current Avatar */}
        <div className="flex items-center gap-4 border-b border-[#f4eae3] pb-5">
          {image ? (
            <img
              src={image}
              alt={name || user.name}
              className="h-16 w-16 rounded-full border border-[#e8dfd6] object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eae3] text-[#b5654d]">
              <UserIcon className="h-7 w-7" />
            </span>
          )}
          <div>
            <p className="text-base font-semibold text-[#1f1a17]">
              {user.name}
            </p>
            <p className="text-xs text-[#6e655f]">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#f4eae3] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#b5654d]">
              {user.role}
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
            Full Name
          </label>
          <div className="relative mt-1.5">
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Email (Read-Only) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
            Email Address (Read-Only)
          </label>
          <input
            type="email"
            disabled
            value={user.email}
            className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-[#e8dfd6] bg-stone-100 px-3.5 py-2.5 text-sm text-[#6e655f]"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
            Phone Number
          </label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Profile Image (Upload or URL) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Profile Image
            </label>
            <div className="flex rounded-lg bg-[#faf7f2] p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${
                  imageMode === "upload"
                    ? "bg-white text-[#1f1a17] shadow-xs"
                    : "text-[#6e655f]"
                }`}
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${
                  imageMode === "url"
                    ? "bg-white text-[#1f1a17] shadow-xs"
                    : "text-[#6e655f]"
                }`}
              >
                <Link2 className="h-3 w-3" />
                Image URL
              </button>
            </div>
          </div>

          {imageMode === "upload" ? (
            <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#d6c9bc] bg-[#faf7f2] px-4 py-3 text-xs font-medium text-[#6e655f] transition hover:border-[#b5654d]">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#b5654d]" />
                  Uploading to ImgBB...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 text-[#b5654d]" />
                  Click to upload new profile image
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
          ) : (
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-3.5 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b5654d] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}

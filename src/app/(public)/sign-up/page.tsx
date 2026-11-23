"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Link2,
  Loader2,
  Lock,
  Mail,
  Scissors,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";
import { uploadImageToImgBB } from "@/lib/api";
import { validatePassword } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
      );
    }
  }, [loading, user, router]);

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setImageUrl(uploadedUrl);
      toast.success("Profile photo uploaded successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: imageUrl.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error.message || "Could not create account.");
        return;
      }

      await refreshUser();
      toast.success("Account created! Welcome to SalonBook.");
      router.replace("/dashboard/customer");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const origin = window.location.origin;
      await signIn.social({
        provider: "google",
        callbackURL: `${origin}/dashboard`,
        errorCallbackURL: `${origin}/sign-in`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Google sign up failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-[#e8dfd6] bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4eae3] text-[#b5654d]">
            <Scissors className="h-5 w-5" />
          </span>
          <h1 className="font-display mt-4 text-3xl font-semibold text-[#1f1a17]">
            Join SalonBook
          </h1>
          <p className="mt-1.5 text-sm text-[#6e655f]">
            Create your customer account to book luxury salon treatments.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="mt-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sophia Laurent"
                className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars, 1 uppercase & 1 lowercase"
                className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#6e655f]">
              At least 6 characters with 1 uppercase and 1 lowercase letter.
            </p>
          </div>

          {/* Profile Image: Upload or URL */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e655f]">
                Profile Photo (Optional)
              </label>
              <div className="flex rounded-lg bg-[#faf7f2] p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 ${
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
                  className={`flex items-center gap-1 rounded-md px-2 py-1 ${
                    imageMode === "url"
                      ? "bg-white text-[#1f1a17] shadow-xs"
                      : "text-[#6e655f]"
                  }`}
                >
                  <Link2 className="h-3 w-3" />
                  URL
                </button>
              </div>
            </div>

            {imageMode === "upload" ? (
              <div className="mt-1.5">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#d6c9bc] bg-[#faf7f2] px-4 py-3 text-xs font-medium text-[#6e655f] transition hover:border-[#b5654d]">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#b5654d]" />
                      Uploading to ImgBB...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 text-[#b5654d]" />
                      {imageUrl ? "Change uploaded image" : "Choose image file"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-3.5 py-2.5 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
              />
            )}

            {imageUrl && (
              <div className="mt-2 flex items-center gap-2.5">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-10 w-10 rounded-full border border-[#e8dfd6] object-cover"
                />
                <span className="truncate text-xs text-emerald-700">
                  Image ready
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1a17] py-3 text-sm font-semibold text-white transition hover:bg-[#b5654d] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e8dfd6]" />
          <span className="text-xs font-medium uppercase text-[#6e655f]">
            or
          </span>
          <div className="h-px flex-1 bg-[#e8dfd6]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#e8dfd6] bg-white py-2.5 text-sm font-semibold text-[#1f1a17] transition hover:bg-[#faf7f2] disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[#6e655f]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#b5654d] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, Scissors } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const authError = searchParams.get("error");
  const { user, loading, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      toast.error(
        `Authentication failed (${authError.replace(/_/g, " ")}). Please try again.`
      );
    }
  }, [authError]);

  useEffect(() => {
    if (!loading && user) {
      if (user.isBlocked) {
        router.replace("/blocked");
      } else if (callbackUrl) {
        router.replace(callbackUrl);
      } else {
        router.replace(
          user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
        );
      }
    }
  }, [loading, user, router, callbackUrl]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password.");
        return;
      }

      const profile = await refreshUser();
      toast.success("Welcome back to SalonBook!");

      if (profile?.isBlocked) {
        router.replace("/blocked");
      } else if (callbackUrl) {
        router.replace(callbackUrl);
      } else {
        router.replace(
          profile?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const origin = window.location.origin;
      const target =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
      await signIn.social({
        provider: "google",
        callbackURL: `${origin}${target}`,
        errorCallbackURL: `${origin}/sign-in`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Google sign in failed.");
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
            Welcome Back
          </h1>
          <p className="mt-1.5 text-sm text-[#6e655f]">
            Sign in to manage your salon appointments and treatments.
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="mt-7 space-y-4">
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
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1a17] py-3 text-sm font-semibold text-white transition hover:bg-[#b5654d] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
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
          onClick={handleGoogleSignIn}
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
          New to SalonBook?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#b5654d] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign in..." />}>
      <SignInContent />
    </Suspense>
  );
}

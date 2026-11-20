"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  User as UserIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashboardHref =
    user?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? "text-[#b5654d]"
        : "text-[#1f1a17]/80 hover:text-[#b5654d]"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dfd6] bg-[#faf7f2]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1a17] text-[#faf7f2]">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-[#1f1a17]">
            SalonBook
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link href="/services" className={navLinkClass("/services")}>
            Browse Services
          </Link>
          {!loading && user && (
            <Link
              href={dashboardHref}
              className={navLinkClass(dashboardHref)}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth Area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-[#e8dfd6]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-[#e8dfd6] bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-[#1f1a17] shadow-xs transition hover:border-[#b5654d]/50"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4eae3] text-[#b5654d]">
                    <UserIcon className="h-4 w-4" />
                  </span>
                )}
                <span className="max-w-[130px] truncate">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-[#6e655f]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#e8dfd6] bg-white p-2 shadow-lg">
                  <div className="border-b border-[#f4eae3] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-[#1f1a17]">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-[#6e655f]">
                      {user.email}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-[#f4eae3] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#b5654d]">
                      {user.role}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#1f1a17] transition hover:bg-[#faf7f2]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#b5654d]" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#1f1a17] transition hover:bg-[#f4eae3]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[#1f1a17] px-5 py-2 text-sm font-medium text-[#faf7f2] transition hover:bg-[#b5654d]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle Menu"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#1f1a17] hover:bg-[#f4eae3] md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#e8dfd6] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="rounded-xl px-3 py-2 text-sm font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
            >
              Browse Services
            </Link>
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[#1f1a17] hover:bg-[#faf7f2]"
                >
                  Dashboard ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/sign-in"
                  className="flex-1 rounded-full border border-[#e8dfd6] px-4 py-2 text-center text-sm font-medium text-[#1f1a17]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex-1 rounded-full bg-[#1f1a17] px-4 py-2 text-center text-sm font-medium text-[#faf7f2]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

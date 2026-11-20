"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Scissors,
  Sparkles,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  {
    label: "My Appointments",
    href: "/dashboard/customer/appointments",
    icon: CalendarClock,
  },
  { label: "My Profile", href: "/dashboard/customer/profile", icon: UserIcon },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  {
    label: "Manage Services",
    href: "/dashboard/admin/services",
    icon: Sparkles,
  },
  {
    label: "Add Service",
    href: "/dashboard/admin/services/new",
    icon: PlusCircle,
  },
  {
    label: "Manage Appointments",
    href: "/dashboard/admin/appointments",
    icon: CalendarClock,
  },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
  { label: "My Profile", href: "/dashboard/admin/profile", icon: UserIcon },
];

export function DashboardShell({
  requiredRole,
  children,
}: {
  requiredRole: "customer" | "admin";
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(
        `/sign-in?callbackUrl=${encodeURIComponent(pathname || "/dashboard")}`
      );
      return;
    }
    if (user.isBlocked) {
      router.replace("/blocked");
      return;
    }
    if (user.role !== requiredRole) {
      toast.error("You do not have permission to access that dashboard.");
      router.replace(
        user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
      );
    }
  }, [loading, user, requiredRole, router, pathname]);

  if (loading || !user || user.isBlocked || user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <PageLoader label="Loading your dashboard..." />
      </div>
    );
  }

  const navItems = requiredRole === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
  };

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-[#e8dfd6] bg-[#1f1a17] text-[#faf7f2] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b5654d] text-white">
              <Scissors className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              SalonBook
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Summary */}
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#b5654d]/60"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5654d]/25 text-[#f4eae3]">
                <UserIcon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <span className="inline-block rounded-full bg-[#b5654d]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f4eae3]">
                {user.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExactRoot =
              item.href === "/dashboard/customer" ||
              item.href === "/dashboard/admin";
            const active = isExactRoot
              ? pathname === item.href
              : pathname === item.href ||
                (item.href !== "/dashboard/admin/services" &&
                  pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#b5654d] text-white shadow-xs"
                    : "text-[#faf7f2]/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#faf7f2]/75 transition hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8dfd6] bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-lg p-2 text-[#1f1a17] hover:bg-[#faf7f2] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-2xl font-semibold text-[#1f1a17]">
              {requiredRole === "admin"
                ? "Admin Dashboard"
                : "Customer Dashboard"}
            </h2>
          </div>

          <Link
            href="/services"
            className="rounded-full border border-[#e8dfd6] bg-[#faf7f2] px-4 py-1.5 text-xs font-semibold text-[#1f1a17] transition hover:border-[#b5654d] hover:text-[#b5654d]"
          >
            Browse Services
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

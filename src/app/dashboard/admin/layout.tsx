import React from "react";
import { DashboardShell } from "@/components/DashboardShell";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell requiredRole="admin">{children}</DashboardShell>;
}

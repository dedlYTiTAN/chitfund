"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  );
}

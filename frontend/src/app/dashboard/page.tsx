"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useUser } from "@/lib/UserContext";

export default function Dashboard() {
  const { currentUser } = useUser();

  return (
    <DashboardLayout>
      {currentUser?.role === 'ADMIN' ? <AdminDashboard /> : <CustomerDashboard />}
    </DashboardLayout>
  );
}

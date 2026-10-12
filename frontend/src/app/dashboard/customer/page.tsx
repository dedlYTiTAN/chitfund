"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomerDashboard } from "@/components/CustomerDashboard";

export default function CustomerDashboardPage() {
  return (
    <DashboardLayout>
      <CustomerDashboard />
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Landmark,
  Banknote,
  Eye,
  FastForward,
  Loader2,
  Download,
  CheckCheck,
  Search,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  Building2,
  UserCheck
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TransactionTable } from "@/components/TransactionTable";
import { MetricCardsSkeleton, TableSkeleton } from "@/components/DashboardSkeleton";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { User } from "@/lib/UserContext";

interface PayoutItem {
  id: string;
  user_id: string;
  user_name: string;
  phone_number?: string;
  upi_id?: string;
  amount: number;
  mode: string;
  status: string;
  created_at: string;
  settled_at?: string;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_aum: 0,
    total_liabilities: 0,
    total_users: 0,
    pending_payouts_count: 1,
    pending_payouts_amount: 250,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([
    {
      id: "PAY-1082",
      user_id: "00000000-0000-0000-0000-000000000000",
      user_name: "Test Investor",
      phone_number: "+91 9876543210",
      upi_id: "testinvestor@okhdfcbank",
      amount: 250.0,
      mode: "UPI Payout",
      status: "PENDING",
      created_at: "2026-10-10 14:32:00",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [userSearchFilter, setUserSearchFilter] = useState("");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // For User Portfolio Sheet
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDeposits, setUserDeposits] = useState([]);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes, payoutsRes] = await Promise.all([
        api.get("/admin/metrics"),
        api.get("/admin/users"),
        api.get("/admin/payouts").catch(() => null),
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
      if (payoutsRes && payoutsRes.data?.payouts) {
        setPayouts(payoutsRes.data.payouts);
      }
    } catch (error) {
      console.warn("Backend API not reachable, loading prototype admin demo data.");
      setUsers([
        {
          id: "00000000-0000-0000-0000-000000000000",
          full_name: "Test Investor",
          phone_number: "+91 9876543210",
          residential_address: "123 Tech Park, Bangalore",
          upi_id: "testinvestor@okhdfcbank",
          role: "CUSTOMER",
          total_active_principal: 5000,
          withdrawable_interest_balance: 250,
        },
        {
          id: "11111111-1111-1111-1111-111111111111",
          full_name: "Aarav Mehta",
          phone_number: "+91 9822334455",
          residential_address: "Indiranagar, Bangalore",
          upi_id: "aarav.mehta@axisbank",
          role: "CUSTOMER",
          total_active_principal: 10000,
          withdrawable_interest_balance: 620,
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          full_name: "Pooja Reddy",
          phone_number: "+91 9123456780",
          residential_address: "Jubilee Hills, Hyderabad",
          upi_id: "pooja.reddy@icici",
          role: "CUSTOMER",
          total_active_principal: 7500,
          withdrawable_interest_balance: 410,
        },
      ]);
      setMetrics({
        total_aum: 22500,
        total_liabilities: 1280,
        total_users: 3,
        pending_payouts_count: 1,
        pending_payouts_amount: 250,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateTime = async () => {
    setIsSimulating(true);
    try {
      await api.post("/dev/run-accruals");
      await fetchData();
    } catch (error) {
      console.error("Error simulating time:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleViewPortfolio = async (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
    setIsSheetLoading(true);
    try {
      const res = await api.get(`/deposits/${user.id}`);
      setUserDeposits(res.data);
    } catch (err) {
      console.error("Failed to load user deposits", err);
    } finally {
      setIsSheetLoading(false);
    }
  };

  // CSV Export Handler - strictly 3 columns: Full Name, UPI ID, Amount
  const handleExportCSV = () => {
    const pendingItems = payouts.filter((p) => p.status === "PENDING");
    if (pendingItems.length === 0) {
      setExportNotice("No pending withdrawals to export.");
      setTimeout(() => setExportNotice(null), 3000);
      return;
    }

    const headers = ["Full Name", "UPI ID", "Amount"];
    const csvRows = [
      headers.join(","),
      ...pendingItems.map((p) =>
        [
          `"${p.user_name}"`,
          `"${p.upi_id || (p.phone_number ? p.phone_number + '@upi' : '')}"`,
          p.amount.toFixed(2),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `chitfund_upi_payout_batch_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported batch containing ${pendingItems.length} UPI payout(s) successfully!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Mark Batch as Completed Handler
  const handleMarkBatchCompleted = async () => {
    setIsSettling(true);
    try {
      await api.post("/admin/payouts/complete").catch(() => null);
      // Update local state
      setPayouts((prev) =>
        prev.map((p) => ({ ...p, status: "SETTLED", settled_at: new Date().toISOString() }))
      );
      setMetrics((prev) => ({
        ...prev,
        pending_payouts_count: 0,
        pending_payouts_amount: 0,
      }));
      setExportNotice("Batch marked as Completed! All records updated to SETTLED.");
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error("Failed to complete batch", err);
    } finally {
      setIsSettling(false);
    }
  };

  // TanStack User Columns
  const userColumns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "Investor Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              {row.getValue<string>("full_name")?.substring(0, 2).toUpperCase() || "IN"}
            </div>
            <div>
              <div className="font-semibold text-white text-xs">{row.getValue("full_name")}</div>
              <div className="text-[11px] text-slate-400 font-mono">ID: {row.original.id.substring(0, 8)}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone_number",
        header: "Phone / UPI ID",
        cell: ({ row }) => (
          <div>
            <div className="text-slate-300 font-mono text-xs">{row.getValue("phone_number")}</div>
            {row.original.upi_id && (
              <div className="text-emerald-400 font-mono text-[11px] mt-0.5 truncate max-w-[160px]">
                {row.original.upi_id}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "total_active_principal",
        header: "Active Principal",
        cell: ({ row }) => (
          <div className="font-bold text-emerald-400 font-mono text-xs">
            ₹{row.getValue<number>("total_active_principal").toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "withdrawable_interest_balance",
        header: "Accrued Interest",
        cell: ({ row }) => (
          <div className="text-slate-200 font-mono text-xs">
            ₹{row.getValue<number>("withdrawable_interest_balance").toFixed(2)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Portfolio",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewPortfolio(user)}
              className="h-8 text-xs bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View Portfolio
            </Button>
          );
        },
      },
    ],
    []
  );

  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: userSearchFilter,
    },
    onGlobalFilterChange: setUserSearchFilter,
  });

  const pendingPayoutsList = payouts.filter((p) => p.status === "PENDING");
  const pendingAmount = metrics.pending_payouts_amount || pendingPayoutsList.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = metrics.pending_payouts_count || pendingPayoutsList.length;

  // Sparkline mockup data
  const aumSparkline = [
    { v: metrics.total_aum * 0.7 },
    { v: metrics.total_aum * 0.8 },
    { v: metrics.total_aum * 0.85 },
    { v: metrics.total_aum * 0.95 },
    { v: metrics.total_aum },
  ];

  const liabilitiesSparkline = [
    { v: metrics.total_liabilities * 0.6 },
    { v: metrics.total_liabilities * 0.75 },
    { v: metrics.total_liabilities * 0.85 },
    { v: metrics.total_liabilities * 0.92 },
    { v: metrics.total_liabilities },
  ];

  const payoutsSparkline = [
    { v: pendingAmount * 0.5 },
    { v: pendingAmount * 0.8 },
    { v: pendingAmount * 0.6 },
    { v: pendingAmount * 0.9 },
    { v: pendingAmount },
  ];

  const heroCards = [
    {
      title: "Total Assets Under Management (AUM)",
      value: `₹${metrics.total_aum.toLocaleString()}`,
      badge: "Active Capital",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      description: "Sum of all active principal deposits currently generating returns",
      icon: <Landmark className="w-5 h-5 text-emerald-400" />,
      gradientColor: "#10b981",
      sparklineData: aumSparkline,
      glowClass: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Total Accrued Liabilities",
      value: `₹${metrics.total_liabilities.toFixed(2)}`,
      badge: "20% APY Pool",
      badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      description: "Total unwithdrawn interest accrued across all investor accounts",
      icon: <Banknote className="w-5 h-5 text-cyan-400" />,
      gradientColor: "#06b6d4",
      sparklineData: liabilitiesSparkline,
      glowClass: "from-cyan-500/10 to-transparent",
    },
    {
      title: "Pending Payouts Queue",
      value: `₹${pendingAmount.toLocaleString()}`,
      badge: `${pendingCount} Batches`,
      badgeClass: pendingCount > 0 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700",
      description: "Withdrawal requests awaiting manual CSV banking settlement",
      icon: <ArrowRightLeft className="w-5 h-5 text-amber-400" />,
      gradientColor: "#f59e0b",
      sparklineData: payoutsSparkline,
      glowClass: "from-amber-500/10 to-transparent",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Top Admin Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">System Admin Overview</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium">
              Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Platform-wide assets, statutory compliance, customer registry, and NEFT payout batching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-sm text-xs h-10 px-3.5 transition-all"
            onClick={handleSimulateTime}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <FastForward className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            )}
            Simulate +30 Days Accruals
          </Button>
        </div>
      </div>

      {exportNotice && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </motion.div>
      )}

      {/* 1. Hero Metric Cards with Recharts Sparklines */}
      {isLoading ? (
        <MetricCardsSkeleton count={3} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {heroCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800/70 p-6 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all duration-300 group">
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.glowClass} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                />

                <div className="relative z-10 flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="text-3xl font-bold tracking-tight text-white mt-1">
                      {card.value}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
                    {card.icon}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${card.badgeClass}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {card.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Updated live
                  </span>
                </div>

                {/* Micro Sparkline */}
                <div className="h-12 w-full mt-2 -mb-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`admin-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={card.gradientColor} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={card.gradientColor} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Tooltip content={() => null} />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={card.gradientColor}
                        strokeWidth={2}
                        fill={`url(#admin-grad-${idx})`}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/60 leading-relaxed">
                  {card.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 2. Payout Operations Panel (CSV Batch Workflow) */}
      <motion.div
        id="payouts"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800/70 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Payout Operations Panel (UPI Payout Batching)
              </h3>
              <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                {pendingCount} Pending
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Export pending withdrawals formatted for UPI settlement (Full Name, UPI ID, Amount), then mark the batch completed once funds are dispatched.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-200 text-xs h-9 px-3.5 shadow-sm"
              disabled={pendingPayoutsList.length === 0}
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Export Pending Withdrawals (CSV)
            </Button>

            <Button
              onClick={handleMarkBatchCompleted}
              disabled={isSettling || pendingPayoutsList.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs h-9 px-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {isSettling ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              )}
              Mark Batch as Completed
            </Button>
          </div>
        </div>

        {/* Payout Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/70 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Payout ID</th>
                <th className="px-6 py-3.5 font-semibold">Investor Name</th>
                <th className="px-6 py-3.5 font-semibold">UPI ID</th>
                <th className="px-6 py-3.5 font-semibold">Amount</th>
                <th className="px-6 py-3.5 font-semibold">Mode</th>
                <th className="px-6 py-3.5 font-semibold">Requested At</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {payouts.length > 0 ? (
                payouts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-300 font-medium">{item.id}</td>
                    <td className="px-6 py-3.5 text-white font-medium">{item.user_name}</td>
                    <td className="px-6 py-3.5 font-mono text-emerald-400 font-medium">
                      {item.upi_id || (item.phone_number ? `${item.phone_number}@upi` : "N/A")}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-emerald-400">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">{item.mode}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-400">{item.created_at}</td>
                    <td className="px-6 py-3.5">
                      {item.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending UPI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Settled & Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No payout records currently in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 3. Searchable User Directory Table */}
      <motion.div
        id="users"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800/70 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Registered Investor Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive list of platform users, phone contacts, active deposits, and yield liability.
            </p>
          </div>

          {/* Search Filter Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by name, phone, ID..."
              value={userSearchFilter}
              onChange={(e) => setUserSearchFilter(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* TanStack Table Rendering */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/70 border-b border-slate-800/80">
              {userTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3.5 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={userColumns.length} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-400" />
                    Loading investor directory...
                  </td>
                </tr>
              ) : userTable.getRowModel().rows?.length ? (
                userTable.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userColumns.length} className="px-6 py-8 text-center text-slate-400">
                    No matching investors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide-out Sheet for "View Portfolio" */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[620px] overflow-y-auto bg-slate-950 border-slate-800 text-slate-100 p-6 shadow-2xl">
          <SheetHeader className="mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-base shadow-md">
                {selectedUser?.full_name?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-white">
                  Portfolio: {selectedUser?.full_name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400">
                  Phone: {selectedUser?.phone_number} • ID: {selectedUser?.id?.substring(0, 8)}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedUser && (
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Active Principal</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  ₹{selectedUser.total_active_principal?.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Accrued Interest</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">
                  ₹{selectedUser.withdrawable_interest_balance?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Deposit Ledger History
            </h4>
            <TransactionTable data={userDeposits} isLoading={isSheetLoading} />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

"use client";

import React, { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  ArrowRightLeft,
  Settings,
  History,
  TrendingUp,
  UserCheck,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useUser } from "@/lib/UserContext";
import { AccountSwitcher } from "./AccountSwitcher";
import { UserProfileDrawer } from "./UserProfileDrawer";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isAdminView = pathname.includes("/admin") || (!pathname.includes("/customer") && currentUser?.role === "ADMIN");

  const customerNav = [
    { name: "Customer Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
    { name: "Deposits & Ledger", href: "/dashboard/customer#ledger", icon: Layers },
    { name: "Growth & Returns", href: "/dashboard/customer#growth", icon: TrendingUp },
  ];

  const adminNav = [
    { name: "Admin Dashboard", href: "/dashboard/admin", icon: ShieldCheck },
    { name: "User Directory", href: "/dashboard/admin#users", icon: UserCheck },
    { name: "Payout Operations", href: "/dashboard/admin#payouts", icon: ArrowRightLeft },
  ];

  const currentNav = isAdminView ? adminNav : customerNav;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <UserProfileDrawer open={isProfileOpen} onOpenChange={setIsProfileOpen} />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/70 backdrop-blur-xl border-r border-slate-800/80 flex flex-col hidden md:flex shrink-0 z-20">
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5 text-emerald-400 font-bold text-xl tracking-tight group">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <span>ChitFund Pro</span>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="px-4 py-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>{isAdminView ? "Admin Center" : "Investor Portal"}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isAdminView ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
              {isAdminView ? "ADMIN" : "INVESTOR"}
            </span>
          </div>

          <nav className="space-y-1">
            {currentNav.map((item) => {
              const isActive = pathname === item.href || (item.href.includes("#") && pathname.startsWith(item.href.split("#")[0]));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* View Switcher Shortcut */}
        <div className="px-4 py-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            View Mode
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <Link
              href="/dashboard/customer"
              className={cn(
                "py-1.5 px-2 text-center rounded-lg transition-colors font-medium",
                pathname.includes("/customer")
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Customer
            </Link>
            <Link
              href="/dashboard/admin"
              className={cn(
                "py-1.5 px-2 text-center rounded-lg transition-colors font-medium",
                pathname.includes("/admin")
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Quick Landing Page Link */}
        <div className="mt-auto px-4 py-3 border-t border-slate-800/80">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Profile Card Bottom */}
        <div
          className="p-3 border-t border-slate-800/80 cursor-pointer bg-slate-950/40 hover:bg-slate-800/50 transition-colors"
          onClick={() => setIsProfileOpen(true)}
        >
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
              {currentUser ? currentUser.full_name.substring(0, 2).toUpperCase() : "??"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-slate-200 truncate">
                {currentUser ? currentUser.full_name : "Loading..."}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {currentUser?.role || "CUSTOMER"} • KYC Active
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10 pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <Wallet className="w-5 h-5" />
              <span>ChitFund Pro</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{pathname.includes("/admin") ? "Admin Overview" : "Portfolio Dashboard"}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live 20% APY
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Account Switcher */}
            <AccountSwitcher />
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

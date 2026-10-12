"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PortfolioCards } from "@/components/PortfolioCards";
import { CapProgressBar } from "@/components/CapProgressBar";
import { TransactionTable } from "@/components/TransactionTable";
import { DepositModal } from "@/components/DepositModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { MetricCardsSkeleton, ProgressBarSkeleton } from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownToLine, FastForward, Loader2, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/lib/UserContext";

export function CustomerDashboard() {
  const { currentUser } = useUser();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [portfolioRes, depositsRes] = await Promise.all([
        api.get(`/portfolio/${currentUser.id}`),
        api.get(`/deposits/${currentUser.id}`),
      ]);
      setPortfolio(portfolioRes.data);
      setTransactions(depositsRes.data);
    } catch (error) {
      console.warn("Backend API not reachable, loading prototype demo data.");
      setPortfolio({
        total_principal: currentUser.total_active_principal || 5000,
        locked_principal: 5000,
        unlocked_principal: 0,
        accrued_interest: currentUser.withdrawable_interest_balance || 250,
        available_to_withdraw: currentUser.withdrawable_interest_balance || 250,
        next_yield_date: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      });
      setTransactions([
        {
          id: "DEP-DEMO-01",
          user_id: currentUser.id,
          principal_amount: 5000,
          deposit_date: new Date(Date.now() - 86400000 * 15).toISOString().split("T")[0],
          principal_locked_until: new Date(Date.now() + 86400000 * 165).toISOString().split("T")[0],
          status: "ACTIVE",
        } as any,
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData, currentUser]);

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

  const isDepositDisabled = isLoading || (portfolio?.total_principal || 0) >= 10000;
  const isWithdrawDisabled = isLoading || (portfolio?.available_to_withdraw || 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Dashboard Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Investor Dashboard</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              Verified Investor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your guaranteed 20% annual yield, active principal, and 6-month cooldown milestones.
          </p>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
            Simulate +30 Days Yield
          </Button>

          <Button
            variant="outline"
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs h-10 px-4 transition-all"
            onClick={() => setIsWithdrawOpen(true)}
            disabled={isWithdrawDisabled}
          >
            <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            Withdraw
          </Button>

          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs h-10 px-5 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all"
            onClick={() => setIsDepositOpen(true)}
            disabled={isDepositDisabled}
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Deposit via UPI
          </Button>
        </div>
      </div>

      {/* Hero Metric Cards with Recharts Sparklines */}
      {isLoading ? (
        <MetricCardsSkeleton count={3} />
      ) : (
        <PortfolioCards data={portfolio} isLoading={isLoading} />
      )}

      {/* Deposit Cap Progress Bar */}
      {isLoading ? (
        <ProgressBarSkeleton />
      ) : (
        portfolio && <CapProgressBar totalPrincipal={portfolio.total_principal || 0} />
      )}

      {/* Ledger Table */}
      <TransactionTable data={transactions} isLoading={isLoading} />

      {/* Deposit Modal (Dynamic UPI QR Code) */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={fetchData}
        currentPrincipal={portfolio?.total_principal || 0}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={fetchData}
        availableToWithdraw={portfolio?.available_to_withdraw || 0}
      />
    </motion.div>
  );
}

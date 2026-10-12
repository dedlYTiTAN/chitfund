"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Unlock, Wallet, Lock, TrendingUp, ShieldAlert, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface PortfolioCardsProps {
  data: {
    total_principal: number;
    locked_principal: number;
    available_to_withdraw: number;
    next_yield_date?: string | null;
  } | null;
  isLoading: boolean;
}

export function PortfolioCards({ data, isLoading }: PortfolioCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const availableAmount = data?.available_to_withdraw || 0;
  const totalPrincipal = data?.total_principal || 0;
  const lockedPrincipal = data?.locked_principal || 0;

  // Mini sparkline data curves
  const availableSparkline = [
    { v: Math.max(availableAmount * 0.4, 0) },
    { v: Math.max(availableAmount * 0.55, 0) },
    { v: Math.max(availableAmount * 0.7, 0) },
    { v: Math.max(availableAmount * 0.85, 0) },
    { v: Math.max(availableAmount * 0.92, 0) },
    { v: availableAmount },
  ];

  const principalSparkline = [
    { v: Math.max(totalPrincipal * 0.5, 0) },
    { v: Math.max(totalPrincipal * 0.5, 0) },
    { v: Math.max(totalPrincipal * 0.75, 0) },
    { v: Math.max(totalPrincipal * 0.75, 0) },
    { v: Math.max(totalPrincipal * 0.9, 0) },
    { v: totalPrincipal },
  ];

  const lockedSparkline = [
    { v: lockedPrincipal },
    { v: Math.max(lockedPrincipal * 0.9, 0) },
    { v: Math.max(lockedPrincipal * 0.85, 0) },
    { v: Math.max(lockedPrincipal * 0.75, 0) },
    { v: Math.max(lockedPrincipal * 0.65, 0) },
    { v: lockedPrincipal },
  ];

  const cards = [
    {
      title: "Available to Withdraw",
      amount: availableAmount,
      formattedAmount: formatCurrency(availableAmount),
      badge: "+20% APY Yield",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      description: "Accrued interest + unlocked principal ready for instant payout",
      icon: <Unlock className="w-5 h-5 text-emerald-400" />,
      gradientColor: "#10b981",
      sparklineData: availableSparkline,
      glowClass: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Total Principal",
      amount: totalPrincipal,
      formattedAmount: formatCurrency(totalPrincipal),
      badge: "Active Deposits",
      badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      description: "Current capital actively earning 20% annualized yield",
      icon: <Wallet className="w-5 h-5 text-cyan-400" />,
      gradientColor: "#06b6d4",
      sparklineData: principalSparkline,
      glowClass: "from-cyan-500/10 to-transparent",
    },
    {
      title: "Locked Principal",
      amount: lockedPrincipal,
      formattedAmount: formatCurrency(lockedPrincipal),
      badge: "6-Mo Cooldown",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      description: "Locked under term commitment to guarantee 20% return",
      icon: <Lock className="w-5 h-5 text-amber-400" />,
      gradientColor: "#f59e0b",
      sparklineData: lockedSparkline,
      glowClass: "from-amber-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800/70 p-6 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all duration-300 group">
            {/* Ambient Corner Glow */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.glowClass} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="relative z-10 flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="text-3xl font-bold tracking-tight text-white mt-1">
                  {card.formattedAmount}
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
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                {card.amount > 0 ? "Compounding daily" : "Awaiting deposit"}
              </span>
            </div>

            {/* Recharts Micro Sparkline */}
            <div className="h-12 w-full mt-2 -mb-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.gradientColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={card.gradientColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={() => null}
                    cursor={{ stroke: card.gradientColor, strokeWidth: 1, strokeDasharray: "2 2" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.gradientColor}
                    strokeWidth={2}
                    fill={`url(#gradient-${idx})`}
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
  );
}

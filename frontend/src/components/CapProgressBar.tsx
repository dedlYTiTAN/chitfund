"use client";

import React from "react";
import { Info, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface CapProgressBarProps {
  totalPrincipal: number;
}

export function CapProgressBar({ totalPrincipal }: CapProgressBarProps) {
  const cap = 10000;
  const percentage = Math.min((totalPrincipal / cap) * 100, 100);
  const remaining = Math.max(cap - totalPrincipal, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isAtCap = totalPrincipal >= cap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/70 shadow-xl relative overflow-hidden"
    >
      {/* Background Accent Shimmer */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Statutory Deposit Limit
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
              Max {formatCurrency(cap)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatCurrency(totalPrincipal)} allocated of {formatCurrency(cap)} regulatory limit
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">capacity used</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5 border border-slate-700/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      {/* Metrics Row */}
      <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
        <span className="text-slate-400">₹0</span>
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          {isAtCap ? (
            <span>Cap Reached (₹10,000 maximum active)</span>
          ) : (
            <span>{formatCurrency(remaining)} remaining allowance</span>
          )}
        </div>
        <span className="text-slate-400">₹10,000</span>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { format, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lock, Unlock, ArrowDownRight, Layers, Calendar, CheckCircle2 } from "lucide-react";
import { TableSkeleton } from "./DashboardSkeleton";

interface Deposit {
  id: string;
  principal_amount: number;
  deposit_date: string;
  principal_locked_until: string;
  status: string;
}

interface TransactionTableProps {
  data: Deposit[];
  isLoading: boolean;
}

export function TransactionTable({ data, isLoading }: TransactionTableProps) {
  const columnHelper = createColumnHelper<Deposit>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("deposit_date", {
        header: "Deposit Date",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <div className="font-medium text-slate-200 text-xs">
                  {format(date, "MMM dd, yyyy")}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {format(date, "HH:mm:ss")} IST
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("principal_amount", {
        header: "Principal",
        cell: (info) => (
          <div>
            <span className="font-bold text-white font-mono text-sm">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(info.getValue())}
            </span>
            <div className="text-[10px] text-emerald-400 font-medium">
              +₹{(info.getValue() * 0.2).toFixed(0)}/yr (20% APY)
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("principal_locked_until", {
        header: "6-Mo Cooldown",
        cell: (info) => {
          const lockDate = new Date(info.getValue());
          const now = new Date();
          const isUnlocked = lockDate <= now;
          const daysRemaining = differenceInDays(lockDate, now);

          return (
            <div>
              <div className="text-xs font-medium text-slate-300">
                {format(lockDate, "MMM dd, yyyy")}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {isUnlocked ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cooldown Met
                  </span>
                ) : (
                  <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : "Unlocking soon"}</span>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const lockDate = new Date(info.row.original.principal_locked_until);
          const isLocked = lockDate > new Date();

          if (status === "WITHDRAWN") {
            return (
              <Badge variant="outline" className="border-slate-800 text-slate-400 bg-slate-950/60 text-xs">
                Withdrawn
              </Badge>
            );
          }

          if (isLocked) {
            return (
              <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs flex items-center gap-1 w-fit">
                <Lock className="w-3 h-3" /> Locked
              </Badge>
            );
          }

          return (
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs flex items-center gap-1 w-fit">
              <Unlock className="w-3 h-3 text-emerald-400" /> Unlocked & Earning
            </Badge>
          );
        },
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  return (
    <motion.div
      id="ledger"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/70 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="p-6 border-b border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Deposit Ledger & Cooldown Status
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual deposit certificates with lock term timeline and daily interest accrual.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {data?.length || 0} Total Deposits
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-950/60 border-b border-slate-800/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-400 text-xs font-semibold uppercase tracking-wider py-3.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 text-xs">
                  No active deposits found. Make your first deposit to start earning 20% APY.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

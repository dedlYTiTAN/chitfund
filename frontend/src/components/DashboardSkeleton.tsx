"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export function MetricCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800/60 p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-32 bg-slate-800/80 rounded-md animate-pulse" />
            <div className="h-9 w-9 bg-slate-800/80 rounded-xl animate-pulse" />
          </div>
          <div className="h-8 w-40 bg-slate-800/80 rounded-md animate-pulse mb-3" />
          <div className="h-10 w-full bg-slate-800/40 rounded-lg animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

export function ProgressBarSkeleton() {
  return (
    <div className="mt-6 bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/60 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-5 w-32 bg-slate-800/80 rounded-md animate-pulse mb-2" />
          <div className="h-4 w-48 bg-slate-800/50 rounded-md animate-pulse" />
        </div>
        <div className="h-7 w-16 bg-slate-800/80 rounded-md animate-pulse" />
      </div>
      <div className="h-3 w-full bg-slate-800/50 rounded-full animate-pulse" />
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="mt-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
        <div className="h-5 w-40 bg-slate-800/80 rounded-md animate-pulse" />
        <div className="h-8 w-28 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4 pb-3 border-b border-slate-800/40">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-2.5 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-800/30 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

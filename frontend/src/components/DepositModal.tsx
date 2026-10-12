"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, QrCode, Copy, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/lib/UserContext";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPrincipal: number;
}

export function DepositModal({ isOpen, onClose, onSuccess, currentPrincipal }: DepositModalProps) {
  const { currentUser } = useUser();
  const [amount, setAmount] = useState("2500");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"input" | "qr">("qr");

  const cap = 10000;
  const maxAllowed = Math.max(cap - currentPrincipal, 0);

  const handleCopyUpi = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText("chitfund@icici");
      }
    } catch {
      // Fallback ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    setError("");
    const value = parseInt(amount, 10);

    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    if (value > maxAllowed) {
      setError(`Amount exceeds your remaining limit of ₹${maxAllowed.toLocaleString()}.`);
      return;
    }

    if (!currentUser) return;

    setIsLoading(true);
    try {
      // Simulate webhook payment confirmation
      await api.post("/deposits/webhook", {
        user_id: currentUser.id,
        amount: value,
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Deposit failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setAmount("2500");
    setStep("qr");
    onClose();
  };

  const numericAmount = parseInt(amount, 10) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Instant UPI Deposit</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs">
            Zero processing fees. 20% annual yield activates immediately upon receipt.
          </DialogDescription>
        </DialogHeader>

        {/* Amount Input & Preset Pills */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium">Deposit Amount (INR)</label>
            <span className="text-slate-400 font-mono">
              Allowance: ₹{maxAllowed.toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold text-lg">
              ₹
            </span>
            <Input
              type="number"
              placeholder="e.g. 5000"
              className="pl-9 text-lg font-mono font-semibold bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              disabled={isLoading}
            />
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2">
            {[1000, 2500, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(Math.min(preset, maxAllowed)))}
                disabled={preset > maxAllowed}
                className={`text-xs py-1 px-2.5 rounded-lg border font-mono transition-colors ${
                  numericAmount === preset
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                } ${preset > maxAllowed ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
            {maxAllowed > 0 && (
              <button
                key="max"
                type="button"
                onClick={() => setAmount(String(maxAllowed))}
                className="text-xs py-1 px-2.5 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono hover:bg-teal-500/20 transition-colors ml-auto"
              >
                Max Cap (₹{maxAllowed.toLocaleString()})
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

        {/* Dynamic UPI QR Code Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Dynamic Bharat UPI QR Code
          </div>

          {/* Realistic Dynamic QR Mock SVG */}
          <div className="relative p-3 bg-white rounded-xl shadow-lg border border-slate-700 group">
            <div className="w-36 h-36 flex items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950" fill="currentColor">
                {/* Corner Positioning Markers */}
                <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="12" width="14" height="14" rx="1" />
                <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="74" y="12" width="14" height="14" rx="1" />
                <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="12" y="74" width="14" height="14" rx="1" />
                
                {/* Data Grid Mockup */}
                <rect x="38" y="8" width="8" height="8" />
                <rect x="50" y="8" width="6" height="8" />
                <rect x="42" y="22" width="16" height="6" />
                <rect x="8" y="38" width="8" height="8" />
                <rect x="22" y="44" width="10" height="6" />
                <rect x="38" y="38" width="12" height="12" rx="2" fill="#10b981" />
                <rect x="56" y="38" width="8" height="6" />
                <rect x="70" y="40" width="12" height="6" />
                <rect x="86" y="40" width="8" height="8" />
                <rect x="38" y="56" width="10" height="8" />
                <rect x="54" y="56" width="12" height="12" />
                <rect x="70" y="54" width="8" height="6" />
                <rect x="82" y="54" width="10" height="8" />
                <rect x="38" y="74" width="14" height="6" />
                <rect x="56" y="74" width="10" height="10" />
                <rect x="72" y="72" width="8" height="12" />
                <rect x="84" y="70" width="10" height="14" />
                <rect x="38" y="86" width="8" height="8" />
                <rect x="52" y="86" width="12" height="6" />
                <rect x="70" y="88" width="16" height="6" />
              </svg>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between w-full max-w-xs text-xs px-2">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase">VPA Handle</span>
              <p className="font-mono text-slate-200 text-xs">chitfund@icici</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyUpi}
              className="h-7 text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" /> Copy VPA
                </>
              )}
            </Button>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan with any UPI app (GPay, PhonePe, Paytm, CRED)</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={isLoading || !numericAmount || numericAmount > maxAllowed}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirm ₹{numericAmount.toLocaleString()} Deposit <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

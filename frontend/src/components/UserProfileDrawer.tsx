"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, Sparkles, QrCode } from "lucide-react";
import { validateUpiId } from "@/lib/validations";

interface UserProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({ open, onOpenChange }: UserProfileDrawerProps) {
  const { currentUser, updateUserProfile } = useUser();
  const [upiInput, setUpiInput] = useState("");
  const [upiError, setUpiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.upi_id) {
      setUpiInput(currentUser.upi_id);
    } else {
      setUpiInput("");
    }
    setUpiError("");
    setSaveSuccess(false);
  }, [currentUser, open]);

  if (!currentUser) return null;

  const handleSaveUpi = async () => {
    setUpiError("");
    setSaveSuccess(false);

    // Zod validation
    const validation = validateUpiId(upiInput);
    if (!validation.success) {
      setUpiError(validation.error || "Invalid UPI ID");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateUserProfile(currentUser.id, { upi_id: upiInput.trim() });
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setUpiError("Failed to save UPI ID. Please try again.");
      }
    } catch (err: any) {
      setUpiError(err.response?.data?.detail || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[500px] bg-slate-950 border-slate-800 text-slate-100 p-6 shadow-2xl overflow-y-auto">
        <SheetHeader className="mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">KYC & Settlement Profile</span>
          </div>
          <SheetTitle className="text-xl font-bold text-white">Investor Profile</SheetTitle>
          <SheetDescription className="text-xs text-slate-400">
            Registered KYC information and default UPI payout destination.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md">
              {currentUser.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{currentUser.full_name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Account ID: {currentUser.id.split("-")[0]}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {currentUser.role || "CUSTOMER"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Full Legal Name</Label>
              <Input
                value={currentUser.full_name}
                disabled
                className="bg-slate-900/60 border-slate-800 text-slate-200 text-xs h-9 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Registered Phone Number</Label>
              <Input
                value={currentUser.phone_number}
                disabled
                className="bg-slate-900/60 border-slate-800 text-slate-200 font-mono text-xs h-9 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Residential Address</Label>
              <Input
                value={currentUser.residential_address || "Primary Verified Residence"}
                disabled
                className="bg-slate-900/60 border-slate-800 text-slate-200 text-xs h-9 cursor-not-allowed"
              />
            </div>

            {/* UPI ID for Payouts */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <Label className="text-xs font-semibold text-white">Registered UPI ID for Payouts</Label>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                  Direct Settlement
                </span>
              </div>

              <div className="space-y-1.5">
                <Input
                  value={upiInput}
                  onChange={(e) => {
                    setUpiInput(e.target.value);
                    setUpiError("");
                    setSaveSuccess(false);
                  }}
                  placeholder="e.g. username@okhdfcbank"
                  className="bg-slate-950 border-slate-800 text-white font-mono text-xs h-9 placeholder:text-slate-600 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Withdrawals will be transferred directly to this VPA address.
                </p>
              </div>

              {upiError && (
                <p className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {upiError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-emerald-400 text-xs bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> UPI ID updated successfully!
                </p>
              )}

              <Button
                size="sm"
                onClick={handleSaveUpi}
                disabled={isSaving || !upiInput.trim() || upiInput.trim() === currentUser.upi_id}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs h-8"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Save UPI ID
              </Button>
            </div>
          </div>

          <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800/80 space-y-2">
            <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-2">
              Financial Summary
            </h3>
            <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Active Principal</span>
              <span className="font-bold font-mono text-emerald-400">
                ₹{currentUser.total_active_principal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-400">Withdrawable Balance</span>
              <span className="font-bold font-mono text-white">
                ₹{currentUser.withdrawable_interest_balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

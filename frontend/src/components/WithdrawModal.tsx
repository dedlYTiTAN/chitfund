"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, CheckCircle2, ShieldCheck, ArrowDownToLine, Zap, QrCode } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/lib/UserContext";
import { validateUpiId } from "@/lib/validations";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableToWithdraw: number;
}

export function WithdrawModal({ isOpen, onClose, onSuccess, availableToWithdraw }: WithdrawModalProps) {
  const { currentUser, updateUserProfile } = useUser();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isQueued, setIsQueued] = useState(false);
  const [confirmedUpi, setConfirmedUpi] = useState("");

  useEffect(() => {
    if (currentUser?.upi_id) {
      setUpiId(currentUser.upi_id);
    } else {
      setUpiId("");
    }
  }, [currentUser, isOpen]);

  const handleWithdraw = async () => {
    setError("");
    setUpiError("");
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (value > availableToWithdraw) {
      setError(`Amount exceeds your available withdrawable balance of ₹${availableToWithdraw.toFixed(2)}.`);
      return;
    }

    // Zod validation on UPI ID
    const validation = validateUpiId(upiId);
    if (!validation.success) {
      setUpiError(validation.error || "A valid Indian UPI ID is required for payout.");
      return;
    }

    if (!currentUser) return;

    setIsLoading(true);
    try {
      // If user changed UPI ID, save it to their profile as well
      if (upiId.trim() !== currentUser.upi_id) {
        await updateUserProfile(currentUser.id, { upi_id: upiId.trim() });
      }

      const response = await api.post("/withdrawals/request", {
        user_id: currentUser.id,
        amount: value,
        upi_id: upiId.trim(),
      });

      setConfirmedUpi(response.data.upi_id || upiId.trim());
      setIsQueued(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Withdrawal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setIsQueued(false);
    setError("");
    setUpiError("");
    onClose();
  };

  const numericAmount = parseFloat(amount) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Instant UPI Withdrawal</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs">
            Direct payout dispatched to your verified Virtual Payment Address (VPA).
          </DialogDescription>
        </DialogHeader>

        {isQueued ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">UPI Withdrawal Queued</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Your withdrawal request of <strong className="text-emerald-400">₹{numericAmount.toLocaleString()}</strong> has been submitted to the Admin Payout Operations queue.
              </p>
            </div>

            {/* Confirmation details displaying registered UPI ID */}
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Beneficiary:</span>
                <span className="text-white font-medium">{currentUser?.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Destination UPI ID:</span>
                <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {confirmedUpi || upiId}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Settlement Mode:</span>
                <span className="text-white">UPI Direct Transfer</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Status:</span>
                <span className="text-amber-400 font-medium">Pending Admin Batch Processing</span>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <label className="text-slate-300 font-medium">Withdrawal Amount (INR)</label>
                <span className="text-emerald-400 font-mono font-medium">
                  Available: ₹{availableToWithdraw.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold text-lg">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-9 text-lg font-mono font-semibold bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                />
              </div>

              {availableToWithdraw > 0 && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount(String(availableToWithdraw))}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline"
                  >
                    Withdraw Full Balance (₹{availableToWithdraw.toFixed(2)})
                  </button>
                </div>
              )}
            </div>

            {/* Destination UPI ID Input with Zod Validation Display */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  Destination UPI ID
                </label>
                {currentUser?.upi_id && upiId === currentUser.upi_id && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Saved on Profile
                  </span>
                )}
              </div>
              <Input
                type="text"
                placeholder="e.g. username@okhdfcbank"
                className="bg-slate-900 border-slate-800 text-white font-mono text-xs h-9 placeholder:text-slate-600 focus:border-emerald-500"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setUpiError("");
                }}
                disabled={isLoading}
              />
              <p className="text-[11px] text-slate-400">
                Funds will be dispatched to this UPI ID during administrative payout execution.
              </p>
              {upiError && (
                <p className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {upiError}
                </p>
              )}
            </div>

            {error && (
              <p className="text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

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
                onClick={handleWithdraw}
                disabled={isLoading || !amount || numericAmount <= 0 || numericAmount > availableToWithdraw}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirm UPI Payout <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

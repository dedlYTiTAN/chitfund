"use client";

import React, { useState } from "react";
import { useUser, User } from "@/lib/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, ShieldCheck, UserPlus, Lock } from "lucide-react";
import api from "@/lib/api";
import { validateUpiId } from "@/lib/validations";

export function AccountSwitcher() {
  const { currentUser, users, switchUser, refreshUsers } = useUser();
  
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<string | null>(null);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: "", phone_number: "", residential_address: "", password: "", role: "CUSTOMER", upi_id: "" });
  const [createUpiError, setCreateUpiError] = useState("");
  
  const handleSelectChange = (val: string | null) => {
    if (!val) return;
    if (val === "create_new") {
      setCreateAccountOpen(true);
      return;
    }
    if (currentUser?.id !== val) {
      setSelectedUserToSwitch(val);
      setPasswordPromptOpen(true);
      setPasswordAttempt("");
      setPasswordError(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (selectedUserToSwitch) {
      const success = await switchUser(selectedUserToSwitch, passwordAttempt);
      if (success) {
        setPasswordPromptOpen(false);
        setSelectedUserToSwitch(null);
      } else {
        setPasswordError(true);
      }
    }
  };

  const handleCreateAccount = async () => {
    setCreateUpiError("");
    
    // Zod validation on UPI ID
    const effectiveUpi = newUser.upi_id.trim() || `${newUser.full_name.toLowerCase().replace(/\s+/g, '')}@okhdfcbank`;
    const validation = validateUpiId(effectiveUpi);
    if (!validation.success) {
      setCreateUpiError(validation.error || "Valid UPI ID required (e.g. user@okhdfcbank)");
      return;
    }

    try {
      const payload = { ...newUser, upi_id: effectiveUpi };
      const res = await api.post("/users/", payload);
      await refreshUsers();
      setCreateAccountOpen(false);
      // Automatically switch to the newly created user
      await switchUser(res.data.id, newUser.password);
      setNewUser({ full_name: "", phone_number: "", residential_address: "", password: "", role: "CUSTOMER", upi_id: "" });
    } catch (err: any) {
      setCreateUpiError(err.response?.data?.detail || "Failed to create account");
      console.error("Failed to create account", err);
    }
  };

  if (!currentUser && users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Select value={currentUser?.id} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[220px] h-10 bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700 focus:ring-emerald-500/20 text-xs">
          <SelectValue placeholder="Switch Account" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          {users.map(u => (
            <SelectItem key={u.id} value={u.id} className="text-xs hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer py-2">
              <div className="flex items-center justify-between w-full gap-2">
                <span className="truncate max-w-[130px] font-medium">{u.full_name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  u.role === "ADMIN" 
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  {u.role || "USER"}
                </span>
              </div>
            </SelectItem>
          ))}
          <div className="border-t border-slate-800 my-1"></div>
          <SelectItem value="create_new" className="text-xs text-emerald-400 font-semibold hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-2">
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> + Create Account
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Password Prompt Dialog */}
      <Dialog open={passwordPromptOpen} onOpenChange={setPasswordPromptOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Unlock Account
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Enter password for this profile (leave blank for default seeded accounts).
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label className="text-xs text-slate-300">Password</Label>
            <Input 
              type="password" 
              value={passwordAttempt} 
              onChange={e => setPasswordAttempt(e.target.value)} 
              placeholder="Leave blank or enter password"
              className="mt-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500" 
              onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
            />
            {passwordError && <p className="text-rose-400 text-xs mt-2">Incorrect password.</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setPasswordPromptOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold" onClick={handlePasswordSubmit}>Unlock Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={createAccountOpen} onOpenChange={setCreateAccountOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" /> Create New User
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Add a new account to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3.5 py-3">
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">Full Name</Label>
              <Input 
                value={newUser.full_name} 
                onChange={e => setNewUser({...newUser, full_name: e.target.value})} 
                placeholder="Rohan Sharma"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" 
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">Phone Number</Label>
              <Input 
                value={newUser.phone_number} 
                onChange={e => setNewUser({...newUser, phone_number: e.target.value})} 
                placeholder="+91 9876543210"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" 
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">Account Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewUser({ ...newUser, role: "CUSTOMER" })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    newUser.role === "CUSTOMER"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Investor (Customer)
                </button>
                <button
                  type="button"
                  onClick={() => setNewUser({ ...newUser, role: "ADMIN" })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    newUser.role === "ADMIN"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">Residential Address</Label>
              <Input 
                value={newUser.residential_address} 
                onChange={e => setNewUser({...newUser, residential_address: e.target.value})} 
                placeholder="Indiranagar, Bangalore"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" 
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">UPI ID (For Instant Payouts)</Label>
              <Input 
                value={newUser.upi_id} 
                onChange={e => {
                  setNewUser({...newUser, upi_id: e.target.value});
                  setCreateUpiError("");
                }} 
                placeholder="rohan@okhdfcbank"
                className={`bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 font-mono text-xs ${
                  createUpiError ? "border-rose-500 focus:border-rose-500" : "focus:border-emerald-500"
                }`} 
              />
              {createUpiError ? (
                <p className="text-rose-400 text-[11px] mt-0.5">{createUpiError}</p>
              ) : (
                <p className="text-slate-500 text-[10px]">Standard VPA format: username@bank</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-slate-300">Password</Label>
              <Input 
                type="password" 
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})} 
                placeholder="Password"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setCreateAccountOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold" onClick={handleCreateAccount}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { TEST_USER_ID } from "./api";

export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  residential_address?: string;
  upi_id?: string;
  role: 'CUSTOMER' | 'ADMIN';
  total_active_principal: number;
  withdrawable_interest_balance: number;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (user_id: string, password?: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
  updateUserProfile: (user_id: string, updates: Partial<User>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_DEMO_USERS: User[] = [
  {
    id: TEST_USER_ID,
    full_name: "Test Investor",
    phone_number: "+91 9876543210",
    residential_address: "123 Tech Park, Bangalore",
    upi_id: "testinvestor@okhdfcbank",
    role: "CUSTOMER",
    total_active_principal: 5000,
    withdrawable_interest_balance: 250,
  },
  {
    id: "admin-0000-0000-0000-000000000001",
    full_name: "Admin Manager",
    phone_number: "+91 0000000000",
    residential_address: "Admin Office",
    upi_id: "admin@okhdfcbank",
    role: "ADMIN",
    total_active_principal: 0,
    withdrawable_interest_balance: 0,
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_DEMO_USERS[0]);
  const [users, setUsers] = useState<User[]>(DEFAULT_DEMO_USERS);

  const refreshUsers = async () => {
    try {
      const res = await api.get("/users/");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
      }
    } catch (error) {
      console.warn("Backend API not reachable, using prototype demo users.");
      setUsers((prev) => (prev.length > 0 ? prev : DEFAULT_DEMO_USERS));
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshUsers().then(async () => {
      try {
        const res = await api.get(`/users/${TEST_USER_ID}`);
        if (res.data) setCurrentUser(res.data);
      } catch (error) {
        // Fallback to initial demo user
        setCurrentUser((curr) => curr || DEFAULT_DEMO_USERS[0]);
      }
    });
  }, []);

  const switchUser = async (user_id: string, password?: string) => {
    try {
      await api.post("/users/login", { user_id, password: password || "" });
      const res = await api.get(`/users/${user_id}`);
      setCurrentUser(res.data);
      return true;
    } catch (error) {
      // Local demo switch fallback
      const found = users.find((u) => u.id === user_id);
      if (found) {
        setCurrentUser(found);
        return true;
      }
      return false;
    }
  };

  const updateUserProfile = async (user_id: string, updates: Partial<User>) => {
    try {
      const res = await api.put(`/users/${user_id}`, updates);
      setCurrentUser(res.data);
      await refreshUsers();
      return true;
    } catch (error) {
      // Local demo update fallback
      setCurrentUser((curr) => (curr ? { ...curr, ...updates } : null));
      setUsers((prev) =>
        prev.map((u) => (u.id === user_id ? { ...u, ...updates } : u))
      );
      return true;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, users, switchUser, refreshUsers, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

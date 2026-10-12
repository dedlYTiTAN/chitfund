"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, ShieldCheck, Lock, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock data for the chart
const data = [
  { month: "Jan", balance: 5000 },
  { month: "Feb", balance: 5083 },
  { month: "Mar", balance: 5168 },
  { month: "Apr", balance: 5254 },
  { month: "May", balance: 5341 },
  { month: "Jun", balance: 5430 },
  { month: "Jul", balance: 6000 }, // Simulated deposit
  { month: "Aug", balance: 6100 },
];

export default function LandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans overflow-x-hidden">
      
      {/* 1. Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xl tracking-tight">
            <Wallet className="w-8 h-8" />
            <span>ChitFund Pro</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#benefits" className="hover:text-white transition-colors">Benefits</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* 2. Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Now accepting new deposits
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Grow Your Wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Absolute Certainty</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-10 leading-relaxed">
                Earn a guaranteed <strong className="text-slate-200">20% annual return</strong> on your secure deposits, backed by a transparent financial architecture designed exclusively for steady, risk-free growth.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-lg font-semibold rounded-xl">
                    Start Investing Today <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full" />
              <Card className="relative bg-slate-900/80 backdrop-blur-xl border-slate-800 overflow-hidden shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Portfolio Balance</p>
                      <h3 className="text-3xl font-bold text-white">₹6,100.00</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" /> +20% APY
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* 3. The Core Rules & Returns (Feature Cards) */}
        <section id="benefits" className="py-24 bg-slate-900 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Built on Strict Structural Integrity</h2>
              <p className="text-lg text-slate-400">Our platform operates on mathematical certainty, not speculation. These immutable rules guarantee system stability and your returns.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-950 border-slate-800 h-full hover:border-emerald-500/50 transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">20% Annual Return</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Yields are structurally calculated and compounded, delivering a flat 20% APY (~1.66% monthly) directly to your withdrawable ledger, day by day.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-950 border-slate-800 h-full hover:border-emerald-500/50 transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">₹10,000 Maximum Cap</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Strict deposit caps prevent centralized risk. By limiting exposure to ₹10,000 per user, we ensure total liquidity and zero financial risk for the community pool.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.3 }}>
                <Card className="bg-slate-950 border-slate-800 h-full hover:border-emerald-500/50 transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">6-Month Cooldown</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Principal deposits are locked for exactly 6 months. This hard-coded cooldown ensures system reserve stability, after which funds are fully withdrawable.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. How It Works (Timeline) */}
        <section id="how-it-works" className="py-24 relative">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The Path to Passive Income</h2>
              <p className="text-lg text-slate-400">Four simple steps to put your capital to work securely.</p>
            </motion.div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              
              {[
                { step: "01", title: "Create Your Account", desc: "Sign up in seconds and complete basic KYC to secure your identity on the platform." },
                { step: "02", title: "Deposit Capital", desc: "Deposit up to the ₹10,000 community cap instantly via secure UPI or Bank Transfer." },
                { step: "03", title: "Watch It Grow", desc: "Track your daily interest accrual on your live dashboard as your 20% APY compounds." },
                { step: "04", title: "Withdraw Anytime", desc: "Withdraw your yields instantly. Withdraw your principal directly to your bank after the 6-month cooldown." },
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-emerald-500 text-slate-950 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="text-emerald-500 font-mono text-sm font-bold mb-2">STEP {item.step}</div>
                    <h4 className="text-xl font-bold text-slate-100 mb-2">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}

            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mt-20 text-center"
            >
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 bg-white hover:bg-slate-200 text-slate-950 text-lg font-semibold rounded-xl">
                  Create Your Account Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12 border-b border-white/5 pb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl tracking-tight mb-4">
                <Wallet className="w-6 h-6" />
                <span>ChitFund Pro</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                Empowering individuals with secure, predictable, and transparent wealth generation infrastructure.
              </p>
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">KYC Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-xs text-slate-600 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} ChitFund Pro. All rights reserved.</p>
            <p className="max-w-xl text-justify md:text-right">
              <strong>Regulatory Disclaimer:</strong> ChitFund Pro operates in strict adherence to local NBFC and Chit Fund regulations. 
              The platform facilitates structured deposits and returns within the legal frameworks of the governing jurisdiction.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

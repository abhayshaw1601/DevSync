"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Code2, Users, Radio, Zap, Shield } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export default function LandingPage() {
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    setRoomId(Date.now().toString());
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 relative">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 Now Available with GitHub Login
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight"
            >
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Real-time collaboration for
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent inline-block relative">
                modern engineering
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Code, sketch, and ship together. An open-source collaborative workspace
              featuring a powerful Monaco editor and infinite canvas whiteboard.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/Room/${roomId}`}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center gap-2 group"
              >
                Start Coding Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl font-semibold transition-all backdrop-blur-sm hover:scale-105 flex items-center justify-center gap-2"
              >
                Try Demo Mode
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-blue-400" />}
              title="Real-time Code Editor"
              description="Monaco-based editor with syntax highlighting, multi-file support, and instant synchronization."
            />
            <FeatureCard
              icon={<Radio className="w-6 h-6 text-indigo-400" />}
              title="Live Collaboration"
              description="See cursors and changes in real-time. Built on Pusher for low-latency communication."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-blue-400" />}
              title="Instant Deployment"
              description="Zero configuration required. Create a room and start coding in seconds."
            />
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-24 border-t border-slate-800/50 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-5 translate-y-8">
                  <StatCard label="Latency" value="< 50ms" />
                  <StatCard label="Uptime" value="99.9%" />
                </div>
                <div className="space-y-5">
                  <StatCard label="Languages" value="20+" />
                  <StatCard label="Users" value="10k+" />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Enterprise-grade Security</h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Your code is safe with us. We use industry-standard encryption and secure authentication flows including GitHub OAuth.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-300 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Secure Authentication (JWT & OAuth)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Private Rooms & Access Control</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Encrypted Data Transmission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/50 relative">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>© 2024 DevSync. Built for developers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-5 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">{value}</div>
      <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  )
}

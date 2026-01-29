"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code2, Radio, Zap, LogIn, Loader2 } from "lucide-react";

export default function LandingPage() {
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRoomId(Date.now().toString());
    setMounted(true);

    // Fetch user authentication status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      window.location.href = `/Room/${joinRoomId.trim()}`;
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Generate particles only on client side
  const particles = mounted ? [...Array(20)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20
  })) : [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Floating particles */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
      >
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-bold text-sm transition-transform group-hover:scale-105">
              D
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              DevSync
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              About
            </Link>

            {loading ? (
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
            ) : user ? (
              <>
                <span className="text-sm font-semibold text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hidden md:block">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-white hover:bg-red-600 text-black hover:text-white px-4 py-2 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div 
              variants={item} 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-neutral-400 text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Introducing DevSync v2.0
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              <span className="text-white">
                Code together.
              </span>
              <br />
              <span className="text-neutral-500">
                Ship faster.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Real-time collaborative workspace with Monaco editor and infinite canvas. 
              Built for modern engineering teams.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/Room/${roomId}`}
                className="group relative w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-100 text-black rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                Create Room
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white border border-white/10 hover:border-white/20 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-white tracking-tight">Everything you need</h2>
            <p className="text-lg text-neutral-500">Powerful features for seamless collaboration</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-white" />}
              title="Real-time Editor"
              description="Monaco-based editor with syntax highlighting and instant sync."
            />
            <FeatureCard
              icon={<Radio className="w-6 h-6 text-white" />}
              title="Live Collaboration"
              description="See changes in real-time with low-latency communication."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-white" />}
              title="Instant Setup"
              description="Zero configuration. Start coding in seconds."
            />
          </div>
        </div>
      </section>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Join a Room</h2>
            <p className="text-neutral-400 mb-6">Enter the room ID to join an existing session</p>
            
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Enter Room ID"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent mb-6 backdrop-blur-sm"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleJoinRoom}
                disabled={!joinRoomId.trim()}
                className="flex-1 px-6 py-3 bg-white hover:bg-neutral-100 text-black rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinRoomId("");
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-semibold transition-all backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

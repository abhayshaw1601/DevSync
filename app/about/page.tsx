"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Code2, Zap, Users, Globe, Lock, Rocket } from "lucide-react";

export default function AboutPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate particles only on client side
    const particles = mounted ? [...Array(20)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 20
    })) : [];

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

            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div 
                            variants={item}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-neutral-400 text-sm font-medium mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            About DevSync
                        </motion.div>

                        <motion.h1
                            variants={item}
                            className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
                        >
                            <span className="text-white">
                                Built for Developers,
                            </span>
                            <br />
                            <span className="text-neutral-500">
                                By Developers
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={item}
                            className="text-xl text-neutral-400 mb-8 max-w-3xl mx-auto leading-relaxed"
                        >
                            A real-time collaboration platform designed for developers to sync their thoughts and code instantly.
                            Built with modern technologies for seamless teamwork.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                            <div>
                                <h2 className="text-3xl font-bold mb-5 text-white">
                                    Our Mission
                                </h2>
                                <p className="text-neutral-400 text-lg leading-relaxed mb-4">
                                    We believe that collaboration should be effortless. DevSync removes the barriers between developers, enabling real-time code sharing and whiteboard collaboration in a single, unified platform.
                                </p>
                                <p className="text-neutral-400 text-lg leading-relaxed">
                                    Whether you are pair programming, conducting technical interviews, or brainstorming architecture, DevSync provides the tools you need to work together seamlessly.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ValueCard
                                    icon={<Zap className="w-6 h-6 text-white" />}
                                    title="Fast"
                                    description="Sub-50ms latency"
                                />
                                <ValueCard
                                    icon={<Lock className="w-6 h-6 text-white" />}
                                    title="Secure"
                                    description="End-to-end encryption"
                                />
                                <ValueCard
                                    icon={<Globe className="w-6 h-6 text-white" />}
                                    title="Global"
                                    description="Worldwide access"
                                />
                                <ValueCard
                                    icon={<Rocket className="w-6 h-6 text-white" />}
                                    title="Modern"
                                    description="Latest tech stack"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 border-t border-white/10 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-white">
                            Built With Modern Technologies
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <TechCard
                                title="Next.js 14"
                                description="React framework with App Router for optimal performance and SEO"
                            />
                            <TechCard
                                title="Monaco Editor"
                                description="VS Code's powerful editor with syntax highlighting and IntelliSense"
                            />
                            <TechCard
                                title="Pusher"
                                description="Real-time WebSocket infrastructure for instant synchronization"
                            />
                            <TechCard
                                title="MongoDB"
                                description="Flexible NoSQL database for storing rooms and user data"
                            />
                            <TechCard
                                title="TypeScript"
                                description="Type-safe development for reliable and maintainable code"
                            />
                            <TechCard
                                title="Tailwind CSS"
                                description="Utility-first CSS framework for rapid UI development"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Highlight */}
            <section className="py-20 border-t border-white/10 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-white">
                            What Makes DevSync Special
                        </h2>
                        <div className="space-y-6">
                            <FeatureRow
                                icon={<Code2 className="w-6 h-6 text-white" />}
                                title="Real-time Code Collaboration"
                                description="See your teammates' cursors and edits in real-time. Multi-file support with syntax highlighting for 20+ languages."
                            />
                            <FeatureRow
                                icon={<Users className="w-6 h-6 text-white" />}
                                title="Infinite Canvas Whiteboard"
                                description="Sketch ideas, draw diagrams, and visualize architecture together on an unlimited canvas."
                            />
                            <FeatureRow
                                icon={<Zap className="w-6 h-6 text-white" />}
                                title="Zero Configuration"
                                description="No setup required. Create a room and share the link. Your teammates can join instantly without accounts."
                            />
                            <FeatureRow
                                icon={<Lock className="w-6 h-6 text-white" />}
                                title="Secure Authentication"
                                description="Optional GitHub OAuth and JWT-based authentication for private rooms and persistent sessions."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Source */}
            <section className="py-20 border-t border-white/10 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="p-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-white/30 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                                <Code2 className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-white">
                                Open Source
                            </h2>
                            <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                                DevSync is open source and built by developers, for developers. We believe in transparency and community-driven development.
                            </p>
                            <a
                                href="https://github.com/abhayshaw1601/DevSync"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-black border border-white/10 rounded-lg font-semibold transition-all hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                View on GitHub
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 relative">
                <div className="container mx-auto px-6 text-center text-neutral-500">
                    <p>© 2024 DevSync. Built for developers.</p>
                </div>
            </footer>
        </div>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-all">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
        </motion.div>
    );
}

function TechCard({ title, description }: { title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
            <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}

function FeatureRow({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            className="flex gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
                <p className="text-neutral-400 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}
"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Code2, Zap, Users, Globe, Lock, Rocket } from "lucide-react";

export default function AboutPage() {
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
        <div className="min-h-screen bg-black text-white selection:bg-white/20 relative">
            {/* Animated Grid Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

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
                        <motion.h1
                            variants={item}
                            className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
                        >
                            <span className="text-white">
                                About DevSync
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
                        <div className="p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
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
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-black border border-white/10 rounded-lg font-semibold transition-all"
                            >
                                View on GitHub
                            </a>
                        </div>
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
        <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
        </div>
    );
}

function TechCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
        </div>
    );
}

function FeatureRow({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
                <p className="text-neutral-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
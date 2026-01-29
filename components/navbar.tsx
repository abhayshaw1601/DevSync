"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Navbar() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [roomId, setRoomId] = useState<string>("");

    useEffect(() => {
        setRoomId(Date.now().toString());
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        window.location.href = '/';
    };

    // Allow customized nav rendering or hide on specific routes if needed
    // For now, it shows everywhere this component is included.

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                        D
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Dev<span className="text-blue-400">Sync</span>
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/demo" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Demo
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        About
                    </Link>

                    <div className="w-px h-5 bg-slate-800" />

                    {loading ? (
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-300 hidden md:block">
                                Hi, {user.name.split(' ')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                Logout
                            </button>
                            <Link
                                href={`/Room/${roomId}`}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                            >
                                New Room
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-white text-slate-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
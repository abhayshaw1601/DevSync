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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-bold text-lg transition-transform group-hover:scale-105">
                        D
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        DevSync
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/demo" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                        Demo
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                        About
                    </Link>

                    <div className="w-px h-5 bg-neutral-800" />

                    {loading ? (
                        <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hidden md:block">
                                Hi, {user.name.split(' ')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                Logout
                            </button>
                            <Link
                                href={`/Room/${roomId}`}
                                className="bg-white hover:bg-neutral-100 text-black text-sm font-medium px-4 py-2 rounded-lg transition-all"
                            >
                                New Room
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-white text-black text-sm font-medium px-4 py-2 rounded hover:bg-neutral-100 transition-colors"
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
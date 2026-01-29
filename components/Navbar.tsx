"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Navbar() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
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

    return (
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
                                className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all"
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
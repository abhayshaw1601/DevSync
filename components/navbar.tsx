"use client";
import Link from "next/link";

export default function Navbar() {
    return (
        <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                            <span className="text-white font-bold text-lg select-none">D</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent select-none">
                            DevSync
                        </span>
                    </Link>

                    {/* Navigation & Actions */}
                    <nav className="flex items-center gap-1 sm:gap-6">
                        <div className="hidden sm:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/About"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                About
                            </Link>
                        </div>

                        <div className="h-5 w-px bg-zinc-800 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <button
                                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-md border border-zinc-800 transition-all cursor-pointer"
                                onClick={() => {
                                    const roomId = prompt("Enter Room ID");
                                    if (roomId) {
                                        window.location.href = `/Room/${roomId}`;
                                    }
                                }}
                            >
                                Join Room
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all cursor-pointer"
                                onClick={() => {
                                    const roomId = Math.random().toString(36).substring(2, 10);
                                    if (roomId) {
                                        window.location.href = `/Room/${roomId}`;
                                    }
                                }}
                            >
                                Create Room
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
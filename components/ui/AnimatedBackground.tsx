"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            
            {/* Animated grid pattern */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px),
                            linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                />
            </div>

            {/* Floating gradient orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.6, 0.4],
                    x: [0, 100, 0],
                    y: [0, -80, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, -120, 0],
                    y: [0, 100, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 80, 0],
                    y: [0, -60, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
                className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]"
            />

            {/* Radial gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-950/50 to-slate-950" />
            
            {/* Subtle noise texture */}
            <div 
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center p-8 font-sans">
            <main className="max-w-2xl text-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    About DevSync
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    DevSync is a real-time collaboration platform designed for developers to sync their thoughts and code instantly.
                    Built with Next.js, it offers seamless room creation and joining capabilities for effortless teamwork.
                </p>
            </main>
        </div>
    );
}
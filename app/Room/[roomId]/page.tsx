import { use } from "react";
import Editor from "@/components/Editor";
// import Whiteboard from "@/components/Whiteboard"; // Assuming Whiteboard exists or will stay as placeholder

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);

    return (
        <main className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden">
            {/* Header */}
            <nav className="h-14 border-b border-slate-700 flex items-center px-6 justify-between bg-slate-800">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Dev<span className="text-blue-400">Sync</span>
                    <span className="ml-4 text-xs font-normal text-zinc-400 border border-zinc-600 px-2 py-0.5 rounded-full">Room: {roomId}</span>
                </h1>
                <div className="flex gap-4">
                    <button className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-md text-sm text-white transition">
                        Share Link
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Full width Editor for now, or split if Whiteboard exists */}
                <div className="w-full h-full">
                    <Editor roomId={roomId} />
                </div>
            </div>
        </main>
    );
}

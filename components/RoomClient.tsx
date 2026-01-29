"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, PenTool, Code2, Maximize2, Minimize2 } from "lucide-react";

// Dynamic import to prevent hydration mismatch from react-resizable-panels
const Editor = dynamic(() => import("@/components/Editor"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500">
            Loading editor...
        </div>
    )
});

// Dynamic import for Canvas
const Canvas = dynamic(() => import("@/components/Canvas"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-800 flex items-center justify-center text-slate-400">
            Loading canvas...
        </div>
    )
});

interface RoomClientProps {
    roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [expandedCanvas, setExpandedCanvas] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShareLink = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const toggleWhiteboard = () => {
        if (showWhiteboard) {
            // Closing whiteboard - also reset expanded state
            setExpandedCanvas(false);
        }
        setShowWhiteboard(!showWhiteboard);
    };

    const toggleExpand = () => {
        setExpandedCanvas(!expandedCanvas);
    };

    // Calculate pane classes based on state
    const getEditorClasses = () => {
        const base = "h-full transition-all duration-500 ease-in-out";
        if (!showWhiteboard) return `${base} w-full opacity-100`;
        if (expandedCanvas) return `${base} w-0 opacity-0 scale-95 overflow-hidden`;
        return `${base} w-1/2 border-r border-slate-700 opacity-100`;
    };

    const getCanvasClasses = () => {
        const base = "h-full transition-all duration-500 ease-in-out";
        if (expandedCanvas) return `${base} w-full`;
        return `${base} w-1/2`;
    };

    return (
        <main className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden">
            {/* Header */}
            <nav className="h-14 border-b border-slate-700 flex items-center px-6 justify-between bg-slate-800">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Dev<span className="text-blue-400">Sync</span>
                    <span className="ml-4 text-xs font-normal text-zinc-400 border border-zinc-600 px-2 py-0.5 rounded-full">
                        Room: {roomId}
                    </span>
                </h1>
                <div className="flex gap-3">
                    {/* Toggle Whiteboard Button */}
                    <button
                        onClick={toggleWhiteboard}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${showWhiteboard
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-zinc-700 hover:bg-zinc-600 text-white"
                            }`}
                    >
                        {showWhiteboard ? (
                            <>
                                <Code2 size={16} />
                                Hide Canvas
                            </>
                        ) : (
                            <>
                                <PenTool size={16} />
                                Show Canvas
                            </>
                        )}
                    </button>

                    {/* Expand/Collapse Canvas Button - Only show when canvas is visible */}
                    {showWhiteboard && (
                        <button
                            onClick={toggleExpand}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${expandedCanvas
                                ? "bg-purple-600 hover:bg-purple-500 text-white"
                                : "bg-zinc-700 hover:bg-zinc-600 text-white"
                                }`}
                            title={expandedCanvas ? "Collapse Canvas" : "Expand Canvas"}
                        >
                            {expandedCanvas ? (
                                <>
                                    <Minimize2 size={16} />
                                    Collapse
                                </>
                            ) : (
                                <>
                                    <Maximize2 size={16} />
                                    Expand
                                </>
                            )}
                        </button>
                    )}

                    {/* Share Link Button */}
                    <button
                        onClick={handleShareLink}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-md text-sm font-medium text-white transition"
                    >
                        {copied ? (
                            <>
                                <Check size={16} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Share Link
                            </>
                        )}
                    </button>
                </div>
            </nav>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Editor Pane */}
                <div className={getEditorClasses()}>
                    <Editor roomId={roomId} />
                </div>

                {/* Canvas Pane */}
                {showWhiteboard && (
                    <div className={getCanvasClasses()}>
                        <Canvas roomId={roomId} />
                    </div>
                )}
            </div>
        </main>
    );
}

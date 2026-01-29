"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, PenTool, Code2, Maximize2, Minimize2, ArrowLeft, Share2, PanelLeftClose, PanelLeft } from "lucide-react";
import FileExplorer, { FileSystemItem } from "./FileExplorer";
import { pusherClient } from "@/lib/pusher";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic imports
const Editor = dynamic(() => import("@/components/Editor"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-950" />
});

const Canvas = dynamic(() => import("@/components/Canvas"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900" />
});

interface RoomClientProps {
    roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [expandedCanvas, setExpandedCanvas] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const [files, setFiles] = useState<FileSystemItem[]>([
        { id: 'default', name: 'loading...', type: 'file', content: '' }
    ]);
    const [activeFileId, setActiveFileId] = useState('default');
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/room/save?roomId=${roomId}`);
                const data = await res.json();
                if (data.room?.files && data.room.files.length > 0) {
                    setFiles(data.room.files);
                    setActiveFileId(data.room.files[0].id);
                } else {
                    setFiles([{ id: 'default', name: 'index.js', type: 'file', content: '// Welcome to DevSync Room\n// Start collaborating!' }]);
                    setActiveFileId('default');
                }
            } catch (error) {
                console.error("Failed to fetch room:", error);
            }
        };
        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        const channel = pusherClient.subscribe(`room-${roomId}`);
        channel.bind('files-sync', (data: { files: FileSystemItem[] }) => {
            isRemoteUpdate.current = true;
            if (data.files) setFiles(data.files);
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });
        channel.bind('file-update', (data: { fileId: string; content: string }) => {
            isRemoteUpdate.current = true;
            setFiles(prev => prev.map(f => f.id === data.fileId ? { ...f, content: data.content } : f));
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });
        return () => { pusherClient.unsubscribe(`room-${roomId}`); };
    }, [roomId]);

    const handleFileContentChange = useCallback((fileId: string, content: string) => {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content } : f));
    }, []);

    const syncFiles = async (updatedFiles: FileSystemItem[]) => {
        setFiles(updatedFiles);
        await fetch("/api/room/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, files: updatedFiles }),
        });
    }

    const handleFileCreate = (name: string, parentId?: string) => {
        const newFile: FileSystemItem = { id: Date.now().toString(), name, type: 'file', content: '', parentId };
        let updated = [...files, newFile];
        if (parentId) updated = updated.map(f => f.id === parentId && f.type === 'folder' ? { ...f, children: [...(f.children || []), newFile.id] } : f);
        syncFiles(updated);
        setActiveFileId(newFile.id);
    };

    const handleFolderCreate = (name: string, parentId?: string) => {
        const newFolder: FileSystemItem = { id: Date.now().toString(), name, type: 'folder', children: [], parentId };
        let updated = [...files, newFolder];
        if (parentId) updated = updated.map(f => f.id === parentId && f.type === 'folder' ? { ...f, children: [...(f.children || []), newFolder.id] } : f);
        syncFiles(updated);
    };

    const handleFileDelete = (id: string) => {
        const getIds = (itemId: string): string[] => {
            const item = files.find(f => f.id === itemId);
            if (!item) return [itemId];
            if (item.type === 'folder' && item.children) return [itemId, ...item.children.flatMap(getIds)];
            return [itemId];
        };
        const idsToDelete = new Set(getIds(id));
        const item = files.find(f => f.id === id);
        let updated = files.filter(f => !idsToDelete.has(f.id));
        if (item?.parentId) updated = updated.map(f => f.id === item.parentId && f.type === 'folder' ? { ...f, children: (f.children || []).filter(c => c !== id) } : f);

        if (idsToDelete.has(activeFileId)) {
            const first = updated.find(f => f.type === 'file');
            if (first) setActiveFileId(first.id);
        }
        syncFiles(updated);
    };

    const handleFileRename = (id: string, name: string) => {
        syncFiles(files.map(f => f.id === id ? { ...f, name } : f));
    };

    const handleShareLink = async () => {
        const url = window.location.href;
        try { await navigator.clipboard.writeText(url); } catch (e) { /* fallback */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
            {/* Header */}
            <nav className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white tracking-tight">Room</span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{roomId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded-md transition-colors ${!showSidebar ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
                        title="Toggle Sidebar"
                    >
                        {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>

                    <div className="h-4 w-px bg-slate-800" />

                    <button
                        onClick={() => { setShowWhiteboard(!showWhiteboard); if (showWhiteboard) setExpandedCanvas(false); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showWhiteboard
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                    >
                        {showWhiteboard ? <Code2 size={16} /> : <PenTool size={16} />}
                        {showWhiteboard ? "Code View" : "Canvas"}
                    </button>

                    {showWhiteboard && (
                        <button
                            onClick={() => setExpandedCanvas(!expandedCanvas)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title={expandedCanvas ? "Minimize" : "Maximize"}
                        >
                            {expandedCanvas ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    )}

                    <button
                        onClick={handleShareLink}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600/10 text-green-400 border border-green-600/20 hover:bg-green-600/20 transition-all"
                    >
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        {copied ? "Copied" : "Share"}
                    </button>
                </div>
            </nav>

            {/* Workspace */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar + Editor */}
                <div className={`flex flex-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${showWhiteboard && expandedCanvas ? 'w-0 opacity-0 overflow-hidden' : 'w-full'} ${showWhiteboard && !expandedCanvas ? 'w-1/2' : ''}`}>
                    <AnimatePresence initial={false}>
                        {showSidebar && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 250, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="border-r border-slate-800 bg-slate-900 overflow-hidden flex-shrink-0"
                            >
                                <FileExplorer
                                    files={files}
                                    activeFileId={activeFileId}
                                    onFileSelect={setActiveFileId}
                                    onFileCreate={handleFileCreate}
                                    onFolderCreate={handleFolderCreate}
                                    onFileDelete={handleFileDelete}
                                    onFileRename={handleFileRename}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 bg-slate-950 relative">
                        <Editor
                            roomId={roomId}
                            files={files}
                            activeFileId={activeFileId}
                            onFileContentChange={handleFileContentChange}
                        />
                    </div>
                </div>

                {/* Canvas Panel */}
                <AnimatePresence>
                    {showWhiteboard && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`absolute right-0 top-0 bottom-0 bg-slate-900 z-20 border-l border-slate-800 ${expandedCanvas ? 'w-full' : 'w-1/2 shadow-2xl'}`}
                        >
                            <Canvas roomId={roomId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

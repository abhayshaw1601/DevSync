"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, PenTool, Code2, Maximize2, Minimize2, ArrowLeft, Share2, PanelLeftClose, PanelLeft, Users } from "lucide-react";
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

interface PresenceMember {
    id: string;
    info: {
        name: string;
        email: string;
    };
}

export default function RoomClient({ roomId }: RoomClientProps) {
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [expandedCanvas, setExpandedCanvas] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showUsers, setShowUsers] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState<PresenceMember[]>([]);

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

        // Subscribe to presence channel for user tracking
        const presenceChannel = pusherClient.subscribe(`presence-room-${roomId}`) as any;
        
        presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
            const users: PresenceMember[] = [];
            members.each((member: any) => {
                users.push({ id: member.id, info: member.info });
            });
            setConnectedUsers(users);
        });

        presenceChannel.bind('pusher:member_added', (member: any) => {
            setConnectedUsers(prev => [...prev, { id: member.id, info: member.info }]);
        });

        presenceChannel.bind('pusher:member_removed', (member: any) => {
            setConnectedUsers(prev => prev.filter(u => u.id !== member.id));
        });

        return () => { 
            pusherClient.unsubscribe(`room-${roomId}`);
            pusherClient.unsubscribe(`presence-room-${roomId}`);
        };
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

    const handleFileMove = (fileId: string, newParentId?: string) => {
        const item = files.find(f => f.id === fileId);
        if (!item) return;

        let updated = [...files];

        // Remove from old parent's children
        if (item.parentId) {
            updated = updated.map(f => 
                f.id === item.parentId && f.type === 'folder' 
                    ? { ...f, children: (f.children || []).filter(c => c !== fileId) }
                    : f
            );
        }

        // Add to new parent's children
        if (newParentId) {
            updated = updated.map(f => 
                f.id === newParentId && f.type === 'folder'
                    ? { ...f, children: [...(f.children || []), fileId] }
                    : f
            );
        }

        // Update the item's parentId
        updated = updated.map(f => f.id === fileId ? { ...f, parentId: newParentId } : f);

        syncFiles(updated);
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
                        onClick={() => setShowUsers(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600/20 transition-all"
                        title="View Connected Users"
                    >
                        <Users size={16} />
                        <span>{connectedUsers.length}</span>
                    </button>

                    <div className="h-4 w-px bg-slate-800" />

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
                                    onFileMove={handleFileMove}
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

            {/* Connected Users Modal */}
            <AnimatePresence>
                {showUsers && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowUsers(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                                            <Users size={20} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">Connected Users</h2>
                                            <p className="text-sm text-slate-400">{connectedUsers.length} {connectedUsers.length === 1 ? 'user' : 'users'} online</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowUsers(false)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M15 5L5 15M5 5l10 10" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[60vh]">
                                {connectedUsers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex p-4 bg-slate-800/50 rounded-full mb-4">
                                            <Users size={32} className="text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 text-sm">No users connected yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {connectedUsers.map((user, index) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                        {user.info.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{user.info.name}</p>
                                                    {user.info.email !== 'guest' && (
                                                        <p className="text-xs text-slate-400 truncate">{user.info.email}</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, PenTool, Code2, Maximize2, Minimize2 } from "lucide-react";
import FileExplorer, { FileSystemItem } from "./FileExplorer";
import { pusherClient } from "@/lib/pusher";

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

    // Multi-file state
    const [files, setFiles] = useState<FileSystemItem[]>([
        { id: 'default', name: 'index.js', type: 'file', content: '// Welcome to DevSync\n// Start coding...' }
    ]);
    const [activeFileId, setActiveFileId] = useState('default');

    const isRemoteUpdate = useRef(false);

    // Fetch initial files from API
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/room/save?roomId=${roomId}`);
                const data = await res.json();
                if (data.room?.files && data.room.files.length > 0) {
                    setFiles(data.room.files);
                    setActiveFileId(data.room.files[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch room:", error);
            }
        };
        fetchRoom();
    }, [roomId]);

    // Pusher subscription for file sync
    useEffect(() => {
        const channel = pusherClient.subscribe(`room-${roomId}`);

        channel.bind('files-sync', (data: { files: FileSystemItem[] }) => {
            console.log('[PUSHER] Received files-sync:', data.files);
            isRemoteUpdate.current = true;
            if (data.files) {
                setFiles(data.files);
            }
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        channel.bind('file-update', (data: { fileId: string; content: string }) => {
            isRemoteUpdate.current = true;
            setFiles(prev => prev.map(f =>
                f.id === data.fileId ? { ...f, content: data.content } : f
            ));
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        return () => {
            pusherClient.unsubscribe(`room-${roomId}`);
        };
    }, [roomId]);

    // Handle file content change
    const handleFileContentChange = useCallback((fileId: string, content: string) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, content } : f
        ));
    }, []);

    // Create new file
    const handleFileCreate = async (fileName: string, parentId?: string) => {
        const newFile: FileSystemItem = {
            id: Date.now().toString(),
            name: fileName,
            type: 'file',
            content: '',
            parentId,
        };
        let updatedFiles = [...files, newFile];

        // Update parent folder's children array
        if (parentId) {
            updatedFiles = updatedFiles.map(f =>
                f.id === parentId && f.type === 'folder'
                    ? { ...f, children: [...(f.children || []), newFile.id] }
                    : f
            );
        }

        setFiles(updatedFiles);
        setActiveFileId(newFile.id);

        await fetch("/api/room/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, files: updatedFiles }),
        });
    };

    // Create new folder
    const handleFolderCreate = async (folderName: string, parentId?: string) => {
        const newFolder: FileSystemItem = {
            id: Date.now().toString(),
            name: folderName,
            type: 'folder',
            children: [],
            parentId,
        };
        let updatedFiles = [...files, newFolder];

        // Update parent folder's children array
        if (parentId) {
            updatedFiles = updatedFiles.map(f =>
                f.id === parentId && f.type === 'folder'
                    ? { ...f, children: [...(f.children || []), newFolder.id] }
                    : f
            );
        }

        setFiles(updatedFiles);

        await fetch("/api/room/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, files: updatedFiles }),
        });
    };

    // Delete file or folder (cascade delete for folders)
    const handleFileDelete = async (fileId: string) => {
        // Get all IDs to delete (including nested children for folders)
        const getIdsToDelete = (id: string): string[] => {
            const item = files.find(f => f.id === id);
            if (!item) return [id];
            if (item.type === 'folder' && item.children) {
                return [id, ...item.children.flatMap(childId => getIdsToDelete(childId))];
            }
            return [id];
        };

        const idsToDelete = new Set(getIdsToDelete(fileId));
        const item = files.find(f => f.id === fileId);

        let updatedFiles = files.filter(f => !idsToDelete.has(f.id));

        // Remove from parent's children array
        if (item?.parentId) {
            updatedFiles = updatedFiles.map(f =>
                f.id === item.parentId && f.type === 'folder'
                    ? { ...f, children: (f.children || []).filter(c => c !== fileId) }
                    : f
            );
        }

        setFiles(updatedFiles);
        if (idsToDelete.has(activeFileId)) {
            const firstFile = updatedFiles.find(f => f.type === 'file');
            if (firstFile) setActiveFileId(firstFile.id);
        }

        await fetch("/api/room/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, files: updatedFiles }),
        });
    };

    // Rename file
    const handleFileRename = async (fileId: string, newName: string) => {
        const updatedFiles = files.map(f =>
            f.id === fileId ? { ...f, name: newName } : f
        );
        setFiles(updatedFiles);

        await fetch("/api/room/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, files: updatedFiles }),
        });
    };

    const handleShareLink = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
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
            setExpandedCanvas(false);
        }
        setShowWhiteboard(!showWhiteboard);
    };

    const toggleExpand = () => {
        setExpandedCanvas(!expandedCanvas);
    };

    // Calculate pane classes based on state
    const getEditorClasses = () => {
        const base = "h-full transition-all duration-500 ease-in-out flex";
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

                    {/* Expand/Collapse Canvas Button */}
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
                {/* Editor Pane with File Explorer */}
                <div className={getEditorClasses()}>
                    <FileExplorer
                        files={files}
                        activeFileId={activeFileId}
                        onFileSelect={setActiveFileId}
                        onFileCreate={handleFileCreate}
                        onFolderCreate={handleFolderCreate}
                        onFileDelete={handleFileDelete}
                        onFileRename={handleFileRename}
                    />
                    <div className="flex-1 h-full">
                        <Editor
                            roomId={roomId}
                            files={files}
                            activeFileId={activeFileId}
                            onFileContentChange={handleFileContentChange}
                        />
                    </div>
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

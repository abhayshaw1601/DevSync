"use client";

import { useState, useEffect, useRef } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ExecuteCode from "./executecode";
import { pusherClient } from "@/lib/pusher";
import { getLanguageFromExtension, FileSystemItem } from "./FileExplorer";
import { FileCode2, TerminalIcon, PlayCircle } from "lucide-react";

interface EditorProps {
    roomId?: string;
    files: FileSystemItem[];
    activeFileId: string;
    onFileContentChange: (fileId: string, content: string) => void;
}

export default function Editor({ roomId, files, activeFileId, onFileContentChange }: EditorProps) {
    const [output, setOutput] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Find active file
    const activeFile = files.find(f => f.id === activeFileId) || files[0];
    const language = activeFile ? getLanguageFromExtension(activeFile.name) : 'javascript';
    const code = activeFile?.content || '';

    // Ref to track if update came from Pusher (to prevent save loop)
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        if (!roomId) return;
        const channel = pusherClient.subscribe(`room-${roomId}`);
        channel.bind('file-update', (data: { fileId: string; content: string }) => {
            if (data.fileId === activeFileId) {
                // only update if it's the current file to prevent jitter, assuming context switches handle full data
                isRemoteUpdate.current = true;
            }
        });
        return () => { pusherClient.unsubscribe(`room-${roomId}`); };
    }, [roomId, activeFileId]);

    // Simple auto-save for editor
    useEffect(() => {
        if (!activeFile || !roomId || isRemoteUpdate.current) return;
        if (activeFile.content === '') return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
                await fetch("/api/room/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomId, files }), // Sync full state
                });
            } finally { setIsSaving(false); }
        }, 1500);
        return () => clearTimeout(timeoutId);
    }, [activeFile?.content, roomId, files]);

    const handleEditorChange = (value: string | undefined) => {
        if (activeFile && value !== undefined) {
            onFileContentChange(activeFile.id, value);
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#1e1e1e] text-slate-300">
            {/* File Tab */}
            <div className="flex items-center justify-between px-4 h-10 bg-[#1e1e1e] border-b border-[#2b2b2b] select-none">
                <div className="flex items-center gap-2.5">
                    <FileCode2 size={14} className="text-blue-400" />
                    <span className="text-sm font-medium text-slate-200">{activeFile?.name || 'No file selected'}</span>
                    {activeFile && (
                        <span className="text-[10px] font-mono text-slate-500 border border-slate-700 px-1.5 rounded uppercase">
                            {language}
                        </span>
                    )}
                </div>
                {roomId && (
                    <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500' : 'bg-green-500/50'}`} title={isSaving ? "Saving..." : "Saved"} />
                )}
            </div>

            <PanelGroup direction="vertical" className="flex-1">
                {/* Editor Panel */}
                <Panel defaultSize={70} minSize={20} className="relative">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                            automaticLayout: true,
                            padding: { top: 20, bottom: 20 },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on"
                        }}
                    />
                </Panel>

                <PanelResizeHandle className="h-1 bg-[#1e1e1e] hover:bg-blue-500 transition-colors" />

                {/* Terminal Panel */}
                <Panel defaultSize={30} minSize={10} className="bg-[#181818] border-t border-[#2b2b2b] flex flex-col">
                    <div className="px-4 h-10 flex shrink-0 justify-between items-center border-b border-[#2b2b2b] bg-[#181818]">
                        <div className="flex items-center gap-2">
                            <TerminalIcon size={14} className="text-slate-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Terminal</span>
                        </div>
                        <ExecuteCode
                            code={code}
                            language={language}
                            onOutputChange={setOutput}
                        />
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                        {output ? (
                            <pre className="whitespace-pre-wrap break-words text-slate-300 leading-relaxed font-[Consolas]">
                                {output}
                            </pre>
                        ) : (
                            <div className="text-slate-600 italic text-xs">
                                Ready to compile...
                            </div>
                        )}
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}

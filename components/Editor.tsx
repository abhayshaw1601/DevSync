"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ExecuteCode from "./executecode";
import { pusherClient } from "@/lib/pusher";
import { getLanguageFromExtension, FileSystemItem } from "./FileExplorer";

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

    // Pusher subscription for real-time updates
    useEffect(() => {
        if (!roomId) return;

        const channel = pusherClient.subscribe(`room-${roomId}`);

        channel.bind('file-update', (data: { fileId: string; content: string }) => {
            isRemoteUpdate.current = true;
            if (data.fileId && data.content !== undefined) {
                onFileContentChange(data.fileId, data.content);
            }
            setTimeout(() => {
                isRemoteUpdate.current = false;
            }, 100);
        });

        channel.bind('files-sync', (data: { files: FileSystemItem[] }) => {
            // Parent will handle this
        });

        return () => {
            pusherClient.unsubscribe(`room-${roomId}`);
        };
    }, [roomId, onFileContentChange]);

    // Auto-save logic - sends full files array to prevent race conditions
    const saveFile = useCallback(async (updatedFiles: FileSystemItem[]) => {
        if (!roomId || isRemoteUpdate.current) return;
        setIsSaving(true);
        try {
            await fetch("/api/room/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, files: updatedFiles }),
            });
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    }, [roomId]);

    // Debounce save
    useEffect(() => {
        if (!activeFile || !roomId || isRemoteUpdate.current) return;

        // Skip saving empty content to prevent race conditions with newly created files
        if (activeFile.content === '') return;

        const timeoutId = setTimeout(() => {
            saveFile(files);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [activeFile?.content, activeFile?.id, roomId, saveFile, files]);

    const handleEditorChange = (value: string | undefined) => {
        if (activeFile && value !== undefined) {
            onFileContentChange(activeFile.id, value);
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-zinc-900 text-white relative">
            {/* File Tab */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-300">{activeFile?.name || 'No file'}</span>
                    <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">{language}</span>
                </div>
                {roomId && (
                    <span className="text-xs text-zinc-500">{isSaving ? "Saving..." : "Saved"}</span>
                )}
            </div>

            <PanelGroup direction="vertical" className="flex-1" id="editor-panel-group">
                {/* Top Panel: Code Editor */}
                <Panel defaultSize={75} minSize={20} id="editor-panel">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                </Panel>

                {/* Resize Handle */}
                <PanelResizeHandle className="h-1.5 bg-zinc-900 hover:bg-blue-600 transition-colors cursor-row-resize flex justify-center items-center group">
                    <div className="w-12 h-1 bg-zinc-700 rounded-full group-hover:bg-white/50 transition-colors" />
                </PanelResizeHandle>

                {/* Bottom Panel: Terminal/Output */}
                <Panel defaultSize={25} minSize={10} id="terminal-panel" className="bg-zinc-900 border-t border-zinc-800 flex flex-col">
                    <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                        <h3 className="text-sm font-semibold text-zinc-400 select-none">Terminal Output</h3>
                        <ExecuteCode
                            code={code}
                            language={language}
                            onOutputChange={setOutput}
                        />
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                        {output ? (
                            <pre className="whitespace-pre-wrap break-words text-zinc-300">
                                {output}
                            </pre>
                        ) : (
                            <div className="text-zinc-600 italic">
                                Click "Run Code" to see the output here...
                            </div>
                        )}
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LangSelect from "./langselect";
import ExecuteCode from "./executecode";

interface EditorProps {
    roomId?: string;
}

export default function Editor({ roomId }: EditorProps) {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState<string | undefined>("// Loading...");
    const [output, setOutput] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch initial code if roomId is present
    useEffect(() => {
        if (!roomId) {
            setCode("// Welcome to DevSync\n// Start coding...");
            return;
        }

        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/room/save?roomId=${roomId}`);
                const data = await res.json();
                if (data.room) {
                    setCode(data.room.code);
                    setLanguage(data.room.language);
                } else {
                    setCode("// Start coding...");
                }
            } catch (error) {
                console.error("Failed to fetch room:", error);
                setCode("// Error loading room");
            }
        };
        fetchRoom();
    }, [roomId]);

    // Auto-save logic
    const saveCode = useCallback(async (newCode: string, newLang: string) => {
        if (!roomId) return;
        setIsSaving(true);
        try {
            await fetch("/api/room/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, code: newCode, language: newLang }),
            });
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    }, [roomId]);

    // Debounce save
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (code && roomId) {
                saveCode(code, language);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [code, language, roomId, saveCode]);

    const handleEditorChange = (value: string | undefined) => {
        setCode(value);
    };

    return (
        <div className="h-full w-full flex overflow-hidden bg-zinc-900 text-white relative">
            <LangSelect language={language} onSelect={setLanguage} />

            <div className="flex-1 h-full flex flex-col">
                <div className="absolute top-2 right-4 z-10 pointer-events-none">
                    {roomId && <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded backdrop-blur-sm transition-opacity">{isSaving ? "Saving..." : "Saved"}</span>}
                </div>

                <PanelGroup direction="vertical" className="h-full">
                    {/* Top Panel: Code Editor */}
                    <Panel defaultSize={75} minSize={20}>
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
                    <Panel defaultSize={25} minSize={10} className="bg-zinc-900 border-t border-zinc-800 flex flex-col">
                        <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <h3 className="text-sm font-semibold text-zinc-400 select-none">Terminal Output</h3>
                            <ExecuteCode
                                code={code || ""}
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
        </div>
    );
}

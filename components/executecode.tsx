import React, { useState } from 'react'

interface ExecuteCodeProps {
    code: string;
    language: string;
    onOutputChange: (output: string) => void;
}

export default function ExecuteCode({ code, language, onOutputChange }: ExecuteCodeProps) {
    const [isLoading, setIsLoading] = useState(false);

    const executeCode = async () => {
        if (!code) return;

        setIsLoading(true);
        // Clear previous output/indicate running
        onOutputChange("Running...");

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                body: JSON.stringify({
                    language: language,
                    version: "*",
                    files: [{ content: code }],
                }),
            });

            const result = await response.json();
            // Piston API returns 'run.output' or sometimes 'message' on top-level error
            const output = result.run ? result.run.output : result.message || "Unknown error";
            onOutputChange(output);
        } catch (error: any) {
            console.error("Execution failed:", error);
            onOutputChange(`Error: ${error.message || "Execution failed"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={executeCode}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-lg transition-all cursor-pointer ${isLoading
                    ? "bg-blue-800 cursor-not-allowed opacity-75 shadow-none"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40"
                }`}
        >
            {isLoading ? "Running..." : "Run Code"}
        </button>
    )
}

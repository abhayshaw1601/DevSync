"use client"; // This is a Client Component

import { useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import LangSelect from "./langselect";

export default function Editor() {
    const [code, setCode] = useState<string | undefined>(
        "// Welcome to DevSync\n// Start coding together..."
    );

    const handleEditorChange = (value: string | undefined) => {
        setCode(value);
        // Tomorrow, we will send this 'value' to Pusher!
        console.log("Current Code:", value);
    };

    return (
        <div className="h-full w-full">
            <LangSelect />
            <MonacoEditor
                height="100%"
                defaultLanguage="javascript"
                defaultValue={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}
import React from 'react';
import {
    SiJavascript,
    SiPython,
    SiCplusplus,
    SiC,
    SiHtml5,
    SiCss3,
    SiTypescript,
    SiGo,
    SiRust,
    SiPhp,
    SiRuby,
    SiSwift,
    SiKotlin,
    SiScala,
    SiHaskell,
    SiLua,
    SiMysql,
    SiJson,
    SiYaml,
    SiMarkdown,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { Terminal, FileCode, FileText } from "lucide-react";
import clsx from "clsx";

interface LangSelectProps {
    language: string;
    onSelect: (lang: string) => void;
}

const languages = [
    { id: "javascript", name: "JavaScript", icon: SiJavascript },
    { id: "python", name: "Python", icon: SiPython },
    { id: "java", name: "Java", icon: FaJava },
    { id: "cpp", name: "C++", icon: SiCplusplus },
    { id: "c", name: "C", icon: SiC },
    { id: "html", name: "HTML", icon: SiHtml5 },
    { id: "css", name: "CSS", icon: SiCss3 },
    { id: "typescript", name: "TypeScript", icon: SiTypescript },
    { id: "go", name: "Go", icon: SiGo },
    { id: "rust", name: "Rust", icon: SiRust },
    { id: "php", name: "PHP", icon: SiPhp },
    { id: "ruby", name: "Ruby", icon: SiRuby },
    { id: "swift", name: "Swift", icon: SiSwift },
    { id: "kotlin", name: "Kotlin", icon: SiKotlin },
    { id: "scala", name: "Scala", icon: SiScala },
    { id: "haskell", name: "Haskell", icon: SiHaskell },
    { id: "lua", name: "Lua", icon: SiLua },
    { id: "shell", name: "Shell", icon: Terminal },
    { id: "sql", name: "SQL", icon: SiMysql },
    { id: "json", name: "JSON", icon: SiJson },
    { id: "xml", name: "XML", icon: FileCode },
    { id: "yaml", name: "YAML", icon: SiYaml },
    { id: "markdown", name: "Markdown", icon: SiMarkdown },
    { id: "plaintext", name: "Plain Text", icon: FileText },
];

export default function LangSelect({ language, onSelect }: LangSelectProps) {
    return (
        <div className="h-full w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 overflow-y-auto gap-4 scrollbar-hide">
            {languages.map((lang) => (
                <button
                    key={lang.id}
                    onClick={() => onSelect(lang.id)}
                    className={clsx(
                        "p-3 rounded-xl transition-all duration-200 group relative",
                        language === lang.id
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    )}
                    title={lang.name}
                >
                    <lang.icon className="w-6 h-6" />

                    {/* Tooltip */}
                    <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        {lang.name}
                    </span>
                </button>
            ))}
        </div>
    );
}

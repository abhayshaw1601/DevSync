"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Pencil,
    Minus,
    Circle,
    Square,
    Pentagon,
    Spline,
    Eraser,
    Grid3X3,
    Trash2,
    Download,
    Save,
    Undo2,
    Palette
} from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { motion, AnimatePresence } from "framer-motion";

type Tool = "pencil" | "line" | "circle" | "rectangle" | "polygon" | "curve" | "eraser";

interface Point {
    x: number;
    y: number;
}

interface DrawElement {
    id: string;
    tool: Tool;
    points: Point[];
    color: string;
    width: number;
}

interface CanvasProps {
    roomId?: string;
}

export default function Canvas({ roomId }: CanvasProps) {
    const [tool, setTool] = useState<Tool>("pencil");
    const [color, setColor] = useState("#3b82f6");
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [showGrid, setShowGrid] = useState(false);
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Ref to track if update came from Pusher
    const isRemoteUpdate = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
        { id: "pencil", icon: <Pencil size={18} />, label: "Pencil" },
        { id: "line", icon: <Minus size={18} />, label: "Line" },
        { id: "curve", icon: <Spline size={18} />, label: "Curve" },
        { id: "circle", icon: <Circle size={18} />, label: "Circle" },
        { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
        { id: "polygon", icon: <Pentagon size={18} />, label: "Polygon" },
        { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
    ];

    const getMousePos = useCallback((e: React.MouseEvent): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (tool === "eraser") return;
        const pos = getMousePos(e);
        const newElement: DrawElement = {
            id: Date.now().toString(),
            tool,
            points: [pos],
            color,
            width: strokeWidth,
        };
        setCurrentElement(newElement);
        setIsDrawing(true);
    }, [tool, color, strokeWidth, getMousePos]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing || !currentElement) return;
        const pos = getMousePos(e);
        if (tool === "pencil" || tool === "curve") {
            setCurrentElement({ ...currentElement, points: [...currentElement.points, pos] });
        } else {
            setCurrentElement({ ...currentElement, points: [currentElement.points[0], pos] });
        }
    }, [isDrawing, currentElement, tool, getMousePos]);

    const handleMouseUp = useCallback(() => {
        if (currentElement && currentElement.points.length > 0) {
            setElements(prev => {
                const newElements = [...prev, currentElement];
                
                // Immediately broadcast the new element for real-time sync
                if (roomId && !isRemoteUpdate.current) {
                    fetch("/api/room/save", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId, elements: newElements }),
                    }).catch(console.error);
                }
                
                return newElements;
            });
        }
        setCurrentElement(null);
        setIsDrawing(false);
    }, [currentElement, roomId]);

    const handleElementClick = useCallback((id: string, e: React.MouseEvent) => {
        if (tool === "eraser") {
            e.stopPropagation();
            setElements(prev => {
                const newElements = prev.filter(el => el.id !== id);
                
                // Immediately broadcast the deletion for real-time sync
                if (roomId && !isRemoteUpdate.current) {
                    fetch("/api/room/save", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId, elements: newElements }),
                    }).catch(console.error);
                }
                
                return newElements;
            });
        }
    }, [tool, roomId]);

    const renderElement = useCallback((el: DrawElement) => {
        const { points, color, width, tool: elTool, id } = el;
        if (points.length === 0) return null;

        const commonProps = {
            stroke: color,
            strokeWidth: width,
            fill: "none",
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
            onClick: (e: React.MouseEvent) => handleElementClick(id, e),
            style: { cursor: tool === "eraser" ? "pointer" : "default" },
        };

        switch (elTool) {
            case "pencil":
            case "curve":
                if (points.length < 2) return null;
                const pathData = points.reduce((acc, point, i) => i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`, "");
                return <path key={id} d={pathData} {...commonProps} />;
            case "line":
                if (points.length < 2) return null;
                return <line key={id} x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} {...commonProps} />;
            case "circle":
                if (points.length < 2) return null;
                const r = Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2));
                return <circle key={id} cx={points[0].x} cy={points[0].y} r={r} {...commonProps} />;
            case "rectangle":
                if (points.length < 2) return null;
                const x = Math.min(points[0].x, points[1].x);
                const y = Math.min(points[0].y, points[1].y);
                const w = Math.abs(points[1].x - points[0].x);
                const h = Math.abs(points[1].y - points[0].y);
                return <rect key={id} x={x} y={y} width={w} height={h} {...commonProps} />;
            case "polygon":
                if (points.length < 2) return null;
                const cx = points[0].x, cy = points[0].y;
                const pr = Math.sqrt(Math.pow(points[1].x - cx, 2) + Math.pow(points[1].y - cy, 2));
                const sides = 6;
                const polyPoints = Array.from({ length: sides }, (_, i) => {
                    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                    return `${cx + pr * Math.cos(angle)},${cy + pr * Math.sin(angle)}`;
                }).join(" ");
                return <polygon key={id} points={polyPoints} {...commonProps} />;
            default: return null;
        }
    }, [tool, handleElementClick]);

    const handleClear = () => {
        setElements([]);
        // Immediately broadcast the clear for real-time sync
        if (roomId && !isRemoteUpdate.current) {
            fetch("/api/room/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, elements: [] }),
            }).catch(console.error);
        }
    };
    const handleExport = () => {
        const svg = svgRef.current;
        if (!svg) return;
        const svgString = new XMLSerializer().serializeToString(svg);
        const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `canvas-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSave = useCallback(async () => {
        if (!roomId || isRemoteUpdate.current) return;
        setIsSaving(true);
        try {
            await fetch("/api/room/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, elements }) });
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    }, [roomId, elements]);

    useEffect(() => {
        if (!roomId) return;
        fetch(`/api/room/save?roomId=${roomId}`).then(r => r.ok && r.json()).then(d => { if (d.room?.elements) setElements(d.room.elements); });
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        const channel = pusherClient.subscribe(`room-${roomId}`);
        channel.bind('canvas-update', (data: { elements: DrawElement[] }) => {
            isRemoteUpdate.current = true;
            if (data.elements) {
                setElements(data.elements);
            }
            setTimeout(() => { isRemoteUpdate.current = false; }, 200);
        });
        return () => { pusherClient.unsubscribe(`room-${roomId}`); };
    }, [roomId]);

    // Remove the auto-save effect since we're now saving immediately on each action
    // useEffect(() => {
    //     if (!roomId || elements.length === 0 || isRemoteUpdate.current) return;
    //     const t = setTimeout(handleSave, 2000);
    //     return () => clearTimeout(t);
    // }, [elements, roomId, handleSave]);

    return (
        <div className="h-full w-full flex flex-col bg-slate-900 relative">
            {/* Floating Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 pl-4 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-xl z-20">

                {/* Tools Group */}
                <div className="flex gap-1">
                    {tools.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`p-2.5 rounded-full transition-all duration-200 ${tool === t.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 transform scale-105"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                }`}
                            title={t.label}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Settings Group */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2.5 rounded-full transition-all ${showGrid ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white"}`}
                        title="Toggle Grid"
                    >
                        <Grid3X3 size={18} />
                    </button>

                    <div className="relative group">
                        <div
                            className="w-6 h-6 rounded-full border border-slate-600 cursor-pointer shadow-inner"
                            style={{ backgroundColor: color }}
                        />
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>

                    <div className="w-20">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Actions */}
                <div className="flex gap-2 pr-2">
                    <button onClick={handleClear} className="p-2.5 text-red-400 hover:bg-slate-700/50 rounded-full transition-colors" title="Clear Canvas">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={handleExport} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors" title="Export SVG">
                        <Download size={18} />
                    </button>
                    {roomId && (
                        <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${isSaving ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                            {isSaving ? "Saving..." : "Saved"}
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-hidden cursor-crosshair bg-[#0f172a]"
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        background: showGrid
                            ? "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"%3E%3Crect width=\"20\" height=\"20\" fill=\"%230f172a\"/%3E%3Ccircle cx=\"1\" cy=\"1\" r=\"1\" fill=\"%231e293b\"/%3E%3C/svg%3E')"
                            : "#0f172a"
                    }}
                >
                    {elements.map(renderElement)}
                    {currentElement && renderElement(currentElement)}
                </svg>
            </div>
        </div>
    );
}

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
    Save
} from "lucide-react";
import { pusherClient } from "@/lib/pusher";

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
    const [color, setColor] = useState("#01070fff");
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [showGrid, setShowGrid] = useState(false);
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Ref to track if update came from Pusher (to prevent save loop)
    const isRemoteUpdate = useRef(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Tool definitions
    const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
        { id: "pencil", icon: <Pencil size={18} />, label: "Pencil" },
        { id: "line", icon: <Minus size={18} />, label: "Line" },
        { id: "circle", icon: <Circle size={18} />, label: "Circle" },
        { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
        { id: "polygon", icon: <Pentagon size={18} />, label: "Polygon" },
        { id: "curve", icon: <Spline size={18} />, label: "Curve" },
        { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
    ];

    // Get mouse position relative to SVG
    const getMousePos = useCallback((e: React.MouseEvent): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    // Start drawing
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

    // Continue drawing
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing || !currentElement) return;

        const pos = getMousePos(e);

        if (tool === "pencil" || tool === "curve") {
            setCurrentElement({
                ...currentElement,
                points: [...currentElement.points, pos],
            });
        } else {
            // For shapes, only keep start and current point
            setCurrentElement({
                ...currentElement,
                points: [currentElement.points[0], pos],
            });
        }
    }, [isDrawing, currentElement, tool, getMousePos]);

    // End drawing
    const handleMouseUp = useCallback(() => {
        if (currentElement && currentElement.points.length > 0) {
            setElements(prev => [...prev, currentElement]);
        }
        setCurrentElement(null);
        setIsDrawing(false);
    }, [currentElement]);

    // Handle eraser click
    const handleElementClick = useCallback((id: string) => {
        if (tool === "eraser") {
            setElements(prev => prev.filter(el => el.id !== id));
        }
    }, [tool]);

    // Render element path
    const renderElement = useCallback((el: DrawElement) => {
        const { points, color, width, tool: elTool, id } = el;
        if (points.length === 0) return null;

        const commonProps = {
            stroke: color,
            strokeWidth: width,
            fill: "none",
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
            onClick: () => handleElementClick(id),
            style: { cursor: tool === "eraser" ? "pointer" : "default" },
        };

        switch (elTool) {
            case "pencil":
            case "curve":
                if (points.length < 2) return null;
                const pathData = points.reduce((acc, point, i) => {
                    return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
                }, "");
                return <path key={id} d={pathData} {...commonProps} />;

            case "line":
                if (points.length < 2) return null;
                return (
                    <line
                        key={id}
                        x1={points[0].x}
                        y1={points[0].y}
                        x2={points[1].x}
                        y2={points[1].y}
                        {...commonProps}
                    />
                );

            case "circle":
                if (points.length < 2) return null;
                const dx = points[1].x - points[0].x;
                const dy = points[1].y - points[0].y;
                const radius = Math.sqrt(dx * dx + dy * dy);
                return (
                    <circle
                        key={id}
                        cx={points[0].x}
                        cy={points[0].y}
                        r={radius}
                        {...commonProps}
                    />
                );

            case "rectangle":
                if (points.length < 2) return null;
                const x = Math.min(points[0].x, points[1].x);
                const y = Math.min(points[0].y, points[1].y);
                const rectWidth = Math.abs(points[1].x - points[0].x);
                const rectHeight = Math.abs(points[1].y - points[0].y);
                return (
                    <rect
                        key={id}
                        x={x}
                        y={y}
                        width={rectWidth}
                        height={rectHeight}
                        {...commonProps}
                    />
                );

            case "polygon":
                // Draw as a hexagon
                if (points.length < 2) return null;
                const centerX = points[0].x;
                const centerY = points[0].y;
                const r = Math.sqrt(
                    Math.pow(points[1].x - centerX, 2) + Math.pow(points[1].y - centerY, 2)
                );
                const sides = 6;
                const polyPoints = Array.from({ length: sides }, (_, i) => {
                    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                    return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                }).join(" ");
                return <polygon key={id} points={polyPoints} {...commonProps} />;

            default:
                return null;
        }
    }, [tool, handleElementClick]);

    // Clear canvas
    const handleClear = () => {
        setElements([]);
    };

    // Export as SVG
    const handleExport = () => {
        const svg = svgRef.current;
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `canvas-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Save to API
    const handleSave = useCallback(async () => {
        if (!roomId || isRemoteUpdate.current) return;
        setIsSaving(true);
        try {
            await fetch("/api/room/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, elements }),
            });
        } catch (error) {
            console.error("Failed to save canvas:", error);
        } finally {
            setIsSaving(false);
        }
    }, [roomId, elements]);

    // Load from API
    useEffect(() => {
        if (!roomId) return;
        const fetchElements = async () => {
            try {
                const res = await fetch(`/api/room/save?roomId=${roomId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.room?.elements) {
                        setElements(data.room.elements);
                    }
                }
            } catch (error) {
                console.error("Failed to load canvas:", error);
            }
        };
        fetchElements();
    }, [roomId]);

    // Pusher subscription for real-time canvas updates
    useEffect(() => {
        if (!roomId) return;

        const channel = pusherClient.subscribe(`room-${roomId}`);

        channel.bind('canvas-update', (data: { elements: DrawElement[] }) => {
            // Mark as remote update to prevent triggering save
            isRemoteUpdate.current = true;
            if (data.elements) {
                setElements(data.elements);
            }
            // Reset after a short delay
            setTimeout(() => {
                isRemoteUpdate.current = false;
            }, 100);
        });

        return () => {
            pusherClient.unsubscribe(`room-${roomId}`);
        };
    }, [roomId]);

    // Auto-save - only save if it's not a remote update
    useEffect(() => {
        if (!roomId || elements.length === 0 || isRemoteUpdate.current) return;
        const timeout = setTimeout(() => {
            handleSave();
        }, 2000);
        return () => clearTimeout(timeout);
    }, [elements, roomId, handleSave]);

    return (
        <div className="h-full w-full flex flex-col bg-slate-900">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-slate-800 border-b border-slate-700 flex-wrap">
                {/* Drawing Tools */}
                <div className="flex gap-1">
                    {tools.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`p-2 rounded-md transition-colors ${tool === t.id
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                            title={t.label}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-600 mx-2" />

                {/* Grid Toggle */}
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-md transition-colors ${showGrid
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                    title="Toggle Grid"
                >
                    <Grid3X3 size={18} />
                </button>

                <div className="w-px h-6 bg-slate-600 mx-2" />

                {/* Color Picker */}
                <div className="flex items-center gap-2">
                    <label className="text-slate-400 text-sm">Color:</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                </div>

                {/* Stroke Width */}
                <div className="flex items-center gap-2">
                    <label className="text-slate-400 text-sm">Width:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-24"
                    />
                    <span className="text-slate-400 text-sm w-6">{strokeWidth}</span>
                </div>

                <div className="flex-1" />

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isSaving && (
                        <span className="text-blue-400 text-sm self-center">Saving...</span>
                    )}
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm transition-colors"
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm transition-colors"
                    >
                        <Download size={16} />
                        Export SVG
                    </button>
                    {roomId && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm transition-colors"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-white"
                style={{ cursor: tool === "eraser" ? "crosshair" : "crosshair" }}
            >
                <svg
                    ref={svgRef}
                    width="2000"
                    height="2000"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ background: showGrid ? "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\"%3E%3Crect width=\"40\" height=\"40\" fill=\"white\"/%3E%3Cpath d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"%23e5e7eb\" stroke-width=\"1\"/%3E%3C/svg%3E')" : "white" }}
                >
                    {/* Render all elements */}
                    {elements.map(renderElement)}

                    {/* Render current element being drawn */}
                    {currentElement && renderElement(currentElement)}
                </svg>
            </div>
        </div>
    );
}

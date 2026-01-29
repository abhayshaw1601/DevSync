"use client";

import { useState } from "react";
import { File, FilePlus, FolderPlus, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, Download, Move } from "lucide-react";

// Extension to Monaco language mapping
export const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'md': 'markdown',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'yaml': 'yaml',
        'yml': 'yaml',
        'xml': 'xml',
        'txt': 'plaintext',
    };
    return languageMap[ext] || 'plaintext';
};

// Updated interface for files and folders
export interface FileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;        // Only for files
    children?: string[];     // Only for folders - array of child IDs
    parentId?: string;       // Reference to parent folder
}

interface FileExplorerProps {
    files: FileSystemItem[];
    activeFileId: string;
    onFileSelect: (fileId: string) => void;
    onFileCreate: (fileName: string, parentId?: string) => void;
    onFolderCreate: (folderName: string, parentId?: string) => void;
    onFileDelete: (fileId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFileMove?: (fileId: string, newParentId?: string) => void;
}

export default function FileExplorer({
    files,
    activeFileId,
    onFileSelect,
    onFileCreate,
    onFolderCreate,
    onFileDelete,
    onFileRename,
    onFileMove,
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder'; parentId?: string } | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [movingItem, setMovingItem] = useState<FileSystemItem | null>(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Get root items (items without parentId)
    const getRootItems = () => files.filter(f => !f.parentId);

    // Get children of a folder
    const getChildren = (folderId: string) => files.filter(f => f.parentId === folderId);

    // Toggle folder expand/collapse
    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    // Start creating a new file or folder
    const startCreating = (type: 'file' | 'folder', parentId?: string) => {
        setIsCreating({ type, parentId });
        setNewItemName("");
        if (parentId) {
            setExpandedFolders(prev => new Set(prev).add(parentId));
        }
    };

    const handleCreate = () => {
        if (newItemName.trim() && isCreating) {
            if (isCreating.type === 'file') {
                onFileCreate(newItemName.trim(), isCreating.parentId);
            } else {
                onFolderCreate(newItemName.trim(), isCreating.parentId);
            }
            setNewItemName("");
            setIsCreating(null);
        }
    };

    const handleRename = (itemId: string) => {
        if (renameValue.trim()) {
            onFileRename(itemId, renameValue.trim());
            setRenamingId(null);
            setRenameValue("");
        }
    };

    const startRename = (item: FileSystemItem) => {
        setRenamingId(item.id);
        setRenameValue(item.name);
    };

    // Download file or folder
    const handleDownload = (item: FileSystemItem) => {
        if (item.type === 'file') {
            // Download single file
            const blob = new Blob([item.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // Download folder as zip (collect all files in folder)
            const folderFiles = collectFolderFiles(item.id);
            if (folderFiles.length === 0) {
                alert('Folder is empty');
                return;
            }
            
            // Create a simple text representation of the folder structure
            let content = `# Folder: ${item.name}\n\n`;
            folderFiles.forEach(file => {
                content += `## File: ${file.name}\n`;
                content += `${file.content || ''}\n\n`;
                content += '---\n\n';
            });
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.name}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Collect all files in a folder recursively
    const collectFolderFiles = (folderId: string): FileSystemItem[] => {
        const children = getChildren(folderId);
        let allFiles: FileSystemItem[] = [];
        
        children.forEach(child => {
            if (child.type === 'file') {
                allFiles.push(child);
            } else if (child.type === 'folder') {
                allFiles = [...allFiles, ...collectFolderFiles(child.id)];
            }
        });
        
        return allFiles;
    };

    // Start moving an item
    const startMove = (item: FileSystemItem) => {
        setMovingItem(item);
        setShowMoveModal(true);
    };

    // Handle move to a new location
    const handleMove = (newParentId?: string) => {
        if (movingItem && onFileMove) {
            // Prevent moving a folder into itself or its children
            if (movingItem.type === 'folder' && newParentId) {
                if (isDescendant(newParentId, movingItem.id)) {
                    alert('Cannot move a folder into itself or its children');
                    return;
                }
            }
            onFileMove(movingItem.id, newParentId);
            setMovingItem(null);
            setShowMoveModal(false);
        }
    };

    // Check if targetId is a descendant of folderId
    const isDescendant = (targetId: string, folderId: string): boolean => {
        const target = files.find(f => f.id === targetId);
        if (!target) return false;
        if (target.id === folderId) return true;
        if (target.parentId) return isDescendant(target.parentId, folderId);
        return false;
    };

    // Count total items for display
    const countItems = () => {
        const fileCount = files.filter(f => f.type === 'file').length;
        const folderCount = files.filter(f => f.type === 'folder').length;
        return { fileCount, folderCount };
    };

    // Recursive render function for tree structure
    const renderItem = (item: FileSystemItem, depth: number = 0) => {
        const isFolder = item.type === 'folder';
        const isExpanded = expandedFolders.has(item.id);
        const children = isFolder ? getChildren(item.id) : [];
        const paddingLeft = 12 + depth * 16;

        return (
            <div key={item.id}>
                <div
                    className={`group flex items-center py-1.5 cursor-pointer transition-colors ${activeFileId === item.id && !isFolder
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        }`}
                    style={{ paddingLeft: `${paddingLeft}px`, paddingRight: '12px' }}
                    onClick={() => {
                        if (isFolder) {
                            toggleFolder(item.id);
                        } else {
                            onFileSelect(item.id);
                        }
                    }}
                    onDoubleClick={() => startRename(item)}
                >
                    {/* Expand/Collapse Arrow for folders */}
                    {isFolder ? (
                        <span className="mr-1">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                    ) : (
                        <span className="mr-1 w-[14px]" />
                    )}

                    {/* Icon */}
                    {isFolder ? (
                        isExpanded ? <FolderOpen size={14} className="mr-2 flex-shrink-0 text-yellow-500" />
                            : <Folder size={14} className="mr-2 flex-shrink-0 text-yellow-500" />
                    ) : (
                        <File size={14} className="mr-2 flex-shrink-0" />
                    )}

                    {/* Name or Rename Input */}
                    {renamingId === item.id ? (
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename(item.id);
                                if (e.key === "Escape") setRenamingId(null);
                            }}
                            onBlur={() => handleRename(item.id)}
                            className="flex-1 px-1 py-0 text-sm bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="flex-1 text-sm truncate">{item.name}</span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {/* Download button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                            }}
                            className="p-0.5 hover:bg-zinc-600 rounded text-zinc-500 hover:text-blue-400"
                            title={isFolder ? "Download Folder" : "Download File"}
                        >
                            <Download size={12} />
                        </button>
                        {/* Move button */}
                        {onFileMove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startMove(item);
                                }}
                                className="p-0.5 hover:bg-zinc-600 rounded text-zinc-500 hover:text-purple-400"
                                title="Move"
                            >
                                <Move size={12} />
                            </button>
                        )}
                        {/* Add file/folder buttons for folders */}
                        {isFolder && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startCreating('file', item.id);
                                    }}
                                    className="p-0.5 hover:bg-zinc-600 rounded text-zinc-500 hover:text-white"
                                    title="New File"
                                >
                                    <FilePlus size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startCreating('folder', item.id);
                                    }}
                                    className="p-0.5 hover:bg-zinc-600 rounded text-zinc-500 hover:text-white"
                                    title="New Folder"
                                >
                                    <FolderPlus size={12} />
                                </button>
                            </>
                        )}
                        {/* Delete button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileDelete(item.id);
                            }}
                            className="p-0.5 hover:bg-red-600/20 rounded text-zinc-500 hover:text-red-400"
                            title={isFolder ? "Delete Folder" : "Delete File"}
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                {/* New item input inside folder */}
                {isCreating && isCreating.parentId === item.id && isExpanded && (
                    <div className="py-1" style={{ paddingLeft: `${paddingLeft + 16}px`, paddingRight: '12px' }}>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") setIsCreating(null);
                            }}
                            placeholder={isCreating.type === 'file' ? "filename.js" : "folder name"}
                            className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                    </div>
                )}

                {/* Render children if folder is expanded */}
                {isFolder && isExpanded && children.map(child => renderItem(child, depth + 1))}
            </div>
        );
    };

    const { fileCount, folderCount } = countItems();

    return (
        <div className="w-56 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                    <Folder size={16} />
                    <span>Explorer</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => startCreating('file')}
                        className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                        title="New File"
                    >
                        <FilePlus size={16} />
                    </button>
                    <button
                        onClick={() => startCreating('folder')}
                        className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                        title="New Folder"
                    >
                        <FolderPlus size={16} />
                    </button>
                </div>
            </div>

            {/* Root New Item Input */}
            {isCreating && !isCreating.parentId && (
                <div className="px-2 py-2 border-b border-zinc-800">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                            if (e.key === "Escape") setIsCreating(null);
                        }}
                        placeholder={isCreating.type === 'file' ? "filename.js" : "folder name"}
                        className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        autoFocus
                    />
                </div>
            )}

            {/* File/Folder Tree */}
            <div className="flex-1 overflow-y-auto py-1">
                {getRootItems().map(item => renderItem(item))}
            </div>

            {/* Item Count */}
            <div className="px-3 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                {fileCount} file{fileCount !== 1 ? "s" : ""}
                {folderCount > 0 && `, ${folderCount} folder${folderCount !== 1 ? "s" : ""}`}
            </div>

            {/* Move Modal */}
            {showMoveModal && movingItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-md w-full">
                        <div className="p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold text-white">Move {movingItem.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1">Select a destination folder or move to root</p>
                        </div>
                        
                        <div className="p-4 max-h-64 overflow-y-auto">
                            {/* Root option */}
                            <button
                                onClick={() => handleMove(undefined)}
                                className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Folder size={16} className="text-yellow-500" />
                                    <span className="text-sm font-medium">Root Directory</span>
                                </div>
                            </button>

                            {/* Folder options */}
                            {files.filter(f => f.type === 'folder' && f.id !== movingItem.id).map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleMove(folder.id)}
                                    disabled={movingItem.type === 'folder' && isDescendant(folder.id, movingItem.id)}
                                    className={`w-full text-left px-3 py-2 rounded transition-colors mb-1 ${
                                        movingItem.type === 'folder' && isDescendant(folder.id, movingItem.id)
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Folder size={16} className="text-yellow-500" />
                                        <span className="text-sm">{folder.name}</span>
                                        {folder.parentId && (
                                            <span className="text-xs text-zinc-500 ml-auto">
                                                in {files.find(f => f.id === folder.parentId)?.name}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {files.filter(f => f.type === 'folder').length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    No folders available. Item will be moved to root.
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setMovingItem(null);
                                    setShowMoveModal(false);
                                }}
                                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

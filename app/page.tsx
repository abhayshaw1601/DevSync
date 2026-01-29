"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import FileExplorer, { FileSystemItem } from "@/components/FileExplorer";

// Dynamic import to prevent hydration issues
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500">
      Loading editor...
    </div>
  )
});

export default function Home() {
  // Local file state for standalone mode (no room/persistence)
  const [files, setFiles] = useState<FileSystemItem[]>([
    { id: 'default', name: 'index.js', type: 'file', content: '// Welcome to DevSync\n// Start coding...' }
  ]);
  const [activeFileId, setActiveFileId] = useState('default');

  const handleFileContentChange = useCallback((fileId: string, content: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, content } : f
    ));
  }, []);

  const handleFileCreate = (fileName: string, parentId?: string) => {
    const newFile: FileSystemItem = {
      id: Date.now().toString(),
      name: fileName,
      type: 'file',
      content: '',
      parentId,
    };
    let updatedFiles = [...files, newFile];

    if (parentId) {
      updatedFiles = updatedFiles.map(f =>
        f.id === parentId && f.type === 'folder'
          ? { ...f, children: [...(f.children || []), newFile.id] }
          : f
      );
    }

    setFiles(updatedFiles);
    setActiveFileId(newFile.id);
  };

  const handleFolderCreate = (folderName: string, parentId?: string) => {
    const newFolder: FileSystemItem = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      children: [],
      parentId,
    };
    let updatedFiles = [...files, newFolder];

    if (parentId) {
      updatedFiles = updatedFiles.map(f =>
        f.id === parentId && f.type === 'folder'
          ? { ...f, children: [...(f.children || []), newFolder.id] }
          : f
      );
    }

    setFiles(updatedFiles);
  };

  const handleFileDelete = (fileId: string) => {
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
  };

  const handleFileRename = (fileId: string, newName: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, name: newName } : f
    ));
  };

  return (
    <main className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden">
      {/* Header Bar */}
      <nav className="h-14 border-b border-slate-700 flex items-center px-6 justify-between bg-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Dev<span className="text-blue-400">Sync</span>
          <span className="ml-4 text-xs font-normal text-zinc-400 border border-zinc-600 px-2 py-0.5 rounded-full">
            Local Mode
          </span>
        </h1>
        <div className="flex gap-4">
          <a
            href={`/Room/${Date.now()}`}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md text-sm font-medium text-white transition"
          >
            Create Room
          </a>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onFileSelect={setActiveFileId}
          onFileCreate={handleFileCreate}
          onFolderCreate={handleFolderCreate}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
        />

        {/* Editor Pane */}
        <div className="flex-1">
          <Editor
            files={files}
            activeFileId={activeFileId}
            onFileContentChange={handleFileContentChange}
          />
        </div>
      </div>
    </main>
  );
}
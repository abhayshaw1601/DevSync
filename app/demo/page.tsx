"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import FileExplorer, { FileSystemItem } from "@/components/FileExplorer";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// Dynamic import to prevent hydration issues
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      Loading editor...
    </div>
  )
});

export default function DemoPage() {
  // Local file state for standalone mode (no room/persistence)
  const [files, setFiles] = useState<FileSystemItem[]>([
    { id: 'default', name: 'demo.js', type: 'file', content: '// Welcome to DevSync Demo\n// Try creating new files or folders!\n\nconsole.log("Hello World");' }
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
    // Delete logic (same as before)
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
    <main className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden">
      {/* Premium Header Bar */}
      <nav className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center text-slate-400 hover:text-white transition-colors gap-2 text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="h-4 w-px bg-slate-700 mx-2" />
          <span className="text-sm font-medium text-slate-200">
            Demo Workspace
          </span>
          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Local Mode
          </span>
        </div>

        <div className="flex gap-3 items-center">
          <Link
            href={`/Room/${Date.now()}`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition shadow-lg shadow-blue-500/20"
          >
            Create Real Room
          </Link>
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
        <div className="flex-1 bg-slate-900 border-l border-slate-800">
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
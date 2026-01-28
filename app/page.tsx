import Editor from "@/components/Editor";
import Whiteboard from "@/components/Whiteboard";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden">
      {/* Header Bar */}
      <nav className="h-14 border-b border-slate-700 flex items-center px-6 justify-between bg-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Dev<span className="text-blue-400">Sync</span>
        </h1>
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md text-sm font-medium text-white transition">
            Share Room
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Code */}
        <div className="w-1/2 border-r border-slate-700">
          <Editor />
        </div>

        {/* Right Pane: Whiteboard */}
        <div className="w-1/2 bg-white">
          <Whiteboard />
        </div>
      </div>
    </main>
  );
}
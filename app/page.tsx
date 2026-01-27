import Image from "next/image";
import Editor from "@/components/Editor";
import Whiteboard from "@/components/Whiteboard";

export default function Home() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <Editor />
        <Whiteboard />
      </div>
    </main>
  );
}

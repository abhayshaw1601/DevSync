import { use } from "react";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center font-sans">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold text-zinc-100">Room: <span className="font-mono text-blue-400">{roomId}</span></h1>
                <p className="text-zinc-500">Waiting for participants...</p>
                {/* Future: Integrate Editor and Whiteboard here */}
            </div>
        </div>
    );
}

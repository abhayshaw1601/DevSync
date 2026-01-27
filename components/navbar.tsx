"use client"
import Link from "next/link";

export default function Navbar() {
    return (
        <div>
            <nav>
                <Link href="/" className="text-white mx-2">Home</Link>
                <Link href="/About" className="text-white mx-2">About</Link>
                <button className="text-white mx-2"
                    onClick={() => {
                        const roomId = Math.random().toString(36).substring(2, 10);
                        if (roomId) {
                            window.location.href = `/Room/${roomId}`;
                        }
                    }}>Create Room</button>
                <button className="text-white mx-2"
                    onClick={() => {
                        const roomId = prompt("Enter Room ID");
                        if (roomId) {
                            window.location.href = `/Room/${roomId}`;
                        }
                    }}>Join Room</button>
            </nav>
        </div>
    );
}
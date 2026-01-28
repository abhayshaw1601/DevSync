import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Room } from '@/models/Room';

export async function POST(req: Request) {
    try {
        const mongoose = await dbConnect();
        console.log(`Connected to DB: ${mongoose.connection.name} on host: ${mongoose.connection.host}`);
        const { roomId, code, language } = await req.json();


        if (!roomId) {
            return NextResponse.json({ error: "roomId is required" }, { status: 400 });
        }

        const room = await Room.findOneAndUpdate(
            { roomId },
            {
                $set: {
                    code,
                    language,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, room });
    } catch (error: any) {
        console.error("Error saving room:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: "roomId is required" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
            return NextResponse.json({ message: "Room not found" }, { status: 404 });
        }

        return NextResponse.json({ room });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

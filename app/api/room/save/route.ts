import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Room } from '@/models/Room';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        const mongoose = await dbConnect();
        console.log(`Connected to DB: ${mongoose.connection.name} on host: ${mongoose.connection.host}`);
        const { roomId, code, language, elements } = await req.json();

        if (!roomId) {
            return NextResponse.json({ error: "roomId is required" }, { status: 400 });
        }

        // Build update object dynamically based on what was provided
        const updateFields: any = { updatedAt: new Date() };
        if (code !== undefined) updateFields.code = code;
        if (language !== undefined) updateFields.language = language;
        if (elements !== undefined) updateFields.elements = elements;

        const room = await Room.findOneAndUpdate(
            { roomId },
            { $set: updateFields },
            { upsert: true, new: true }
        );

        // Trigger Pusher events based on what was updated
        if (code !== undefined || language !== undefined) {
            await pusherServer.trigger(`room-${roomId}`, 'code-update', {
                code,
                language
            });
        }

        if (elements !== undefined) {
            await pusherServer.trigger(`room-${roomId}`, 'canvas-update', {
                elements
            });
        }

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

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Room } from '@/models/Room';
import { pusherServer } from '@/lib/pusher';

interface FileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: string[];
    parentId?: string;
}

export async function POST(req: Request) {
    try {
        const mongoose = await dbConnect();

        // Auth check
        const { getSession } = await import('@/lib/auth');
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`Connected to DB: ${mongoose.connection.name} on host: ${mongoose.connection.host}`);
        const body = await req.json();
        const { roomId, files, fileId, content, elements } = body;
        console.log(`[SAVE] roomId=${roomId}, hasFiles=${!!files}, fileId=${fileId}, contentLen=${content?.length}, filesCount=${files?.length}`);
        if (files && files.length > 0) {
            console.log('[SAVE] Files structure:', JSON.stringify(files.map((f: any) => ({
                id: f.id,
                name: f.name,
                type: f.type,
                parentId: f.parentId,
                hasChildren: !!f.children
            })), null, 2));
        }

        if (!roomId) {
            return NextResponse.json({ error: "roomId is required" }, { status: 400 });
        }

        // Handle single file content update with atomic operation (highest priority)
        if (fileId !== undefined && content !== undefined) {
            // Use MongoDB's positional operator for atomic update
            // This prevents race conditions by updating in a single operation
            const result = await Room.updateOne(
                { roomId, 'files.id': fileId },
                { $set: { 'files.$.content': content, updatedAt: new Date() } }
            );
            
            if (result.matchedCount === 0) {
                console.log(`File ${fileId} not found in room ${roomId}, skipping content update`);
            } else {
                console.log(`Successfully updated file ${fileId} content atomically`);
                // Trigger Pusher event for real-time sync
                await pusherServer.trigger(`room-${roomId}`, 'file-update', { fileId, content });
            }
            
            // Get updated room for response
            const room = await Room.findOne({ roomId });
            return NextResponse.json({ success: true, room });
        }

        // Build update object for other operations
        const updateFields: any = { updatedAt: new Date() };

        // Handle full files array update (create/delete/rename)
        if (files !== undefined) {
            updateFields.files = files;
        }

        // Handle canvas elements
        if (elements !== undefined) {
            updateFields.elements = elements;
        }

        const room = await Room.findOneAndUpdate(
            { roomId },
            { $set: updateFields },
            { upsert: true, new: true }
        );

        // Trigger Pusher events based on what was updated
        if (files !== undefined) {
            await pusherServer.trigger(`room-${roomId}`, 'files-sync', { files });
        }

        if (elements !== undefined) {
            await pusherServer.trigger(`room-${roomId}`, 'canvas-update', { elements });
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

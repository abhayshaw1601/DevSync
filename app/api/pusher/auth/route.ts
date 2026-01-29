import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const user = await getUser();
        
        // Allow anonymous users with a guest identifier
        const userData = user ? {
            user_id: user.id,
            user_info: {
                name: user.name || user.email.split('@')[0],
                email: user.email
            }
        } : {
            user_id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_info: {
                name: `Guest ${Math.floor(Math.random() * 1000)}`,
                email: 'guest'
            }
        };

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channelName, userData);
        
        return NextResponse.json(authResponse);
    } catch (error: any) {
        console.error('Pusher auth error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

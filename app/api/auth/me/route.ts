import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

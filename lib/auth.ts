import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'devsync-secret-key-change-this';

export interface JWTPayload {
    userId: string;
    email: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        const payload = await verifyToken(token);
        if (!payload) return null;

        return payload;
    } catch (error) {
        return null;
    }
}

export async function getUser() {
    const session = await getSession();
    if (!session) return null;

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) return null;

    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name
    };
}

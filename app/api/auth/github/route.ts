import { NextResponse } from 'next/server';

export async function GET() {
    const GITHUB_ID = process.env.GITHUB_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;

    if (!GITHUB_ID) {
        return NextResponse.json({ error: 'GitHub Client ID not configured' }, { status: 500 });
    }

    const params = new URLSearchParams({
        client_id: GITHUB_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'user:email', // Request email scope
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(url);
}

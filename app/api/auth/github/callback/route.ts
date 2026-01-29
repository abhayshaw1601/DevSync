import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { signToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const GITHUB_ID = process.env.GITHUB_ID;
        const GITHUB_SECRET = process.env.GITHUB_SECRET;
        const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;

        if (!code || !GITHUB_ID || !GITHUB_SECRET) {
            return NextResponse.json({ error: 'Missing code or credentials' }, { status: 400 });
        }

        // 1. Exchange code for access token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_ID,
                client_secret: GITHUB_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch User Profile
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
        });
        const githubUser = await userRes.json();

        // 3. Fetch User Emails (to handle private emails)
        let email = githubUser.email;
        if (!email) {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
            });
            const emails = await emailsRes.json();

            // Find primary, verified email
            const primaryEmail = emails.find((e: any) => e.primary && e.verified) ||
                emails.find((e: any) => e.verified) ||
                emails[0];

            if (primaryEmail) {
                email = primaryEmail.email;
            }
        }

        if (!email) {
            return NextResponse.json({ error: 'Could not retrieve email from GitHub. Please allow email access.' }, { status: 400 });
        }

        // 4. Find or Create User in DB
        await dbConnect();

        // Check if user exists by GitHub ID first, then by Email
        let user = await User.findOne({ githubId: githubUser.id.toString() });

        if (!user) {
            // Check if email already exists (link account)
            user = await User.findOne({ email });

            if (user) {
                // Link existing account
                user.githubId = githubUser.id.toString();
                if (!user.image) user.image = githubUser.avatar_url;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    email,
                    name: githubUser.name || githubUser.login,
                    githubId: githubUser.id.toString(),
                    image: githubUser.avatar_url,
                });
            }
        }

        // 5. Issue Session Token
        const token = await signToken({ userId: user._id.toString(), email: user.email });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // 6. Redirect to Home
        return NextResponse.redirect(new URL('/', req.url));

    } catch (error) {
        console.error('GitHub Callback Error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

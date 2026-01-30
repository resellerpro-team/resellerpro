import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Fixed credentials for Ekodrix Panel
const VALID_USERNAME = 'ekodrix-user'
const VALID_PASSWORD = 'Ekodrix@2026!'
const SESSION_COOKIE_NAME = 'ekodrix-session'
const SESSION_SECRET = 'ekodrix-panel-secret-2026'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Validate credentials
        if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create session token (simple base64 encoding for demo - in production use JWT)
        const sessionData = {
            user: username,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }
        const sessionToken = Buffer.from(
            JSON.stringify(sessionData) + '|' + SESSION_SECRET
        ).toString('base64')

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        })

        return NextResponse.json({ success: true, message: 'Login successful' })
    } catch (error) {
        console.error('Ekodrix auth error:', error)
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    // Logout - clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return NextResponse.json({ success: true })
}

export async function GET() {
    // Check session validity
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    try {
        const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
        const [dataStr, secret] = decoded.split('|')

        if (secret !== SESSION_SECRET) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const data = JSON.parse(dataStr)
        if (data.exp < Date.now()) {
            return NextResponse.json({ authenticated: false, message: 'Session expired' }, { status: 401 })
        }

        return NextResponse.json({ authenticated: true, user: data.user })
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
}

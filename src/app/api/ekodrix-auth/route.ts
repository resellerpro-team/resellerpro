/**
 * 🔒 Ekodrix Panel Authentication API
 * 
 * SECURITY FIXES APPLIED:
 * - Credentials moved to environment variables
 * - Base64 encoding replaced with JWT tokens
 * - Bcrypt password hashing
 * - Strict cookie settings (httpOnly, secure, sameSite)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
    validateAdminCredentials,
    createSessionToken,
    verifyEkodrixAuth,
    getSessionCookieOptions
} from '@/lib/ekodrix-auth'

const SESSION_COOKIE_NAME = 'ekodrix-session'

/**
 * POST /api/ekodrix-auth - Login
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Username and password required' },
                { status: 400 }
            )
        }

        // Validate credentials (uses bcrypt comparison)
        const isValid = await validateAdminCredentials(username, password)

        if (!isValid) {
            // Generic error message to prevent enumeration
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create JWT session token
        const sessionToken = createSessionToken(username)

        // Set secure session cookie
        const cookieStore = await cookies()
        const cookieOptions = getSessionCookieOptions()

        cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            maxAge: cookieOptions.maxAge,
            path: cookieOptions.path,
        })

        return NextResponse.json({ success: true, message: 'Login successful' })
    } catch (error) {
        console.error('[Ekodrix Auth] Login error:', error)
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/ekodrix-auth - Logout
 */
export async function DELETE() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete(SESSION_COOKIE_NAME)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Ekodrix Auth] Logout error:', error)
        return NextResponse.json({ success: true }) // Still succeed even on error
    }
}

/**
 * GET /api/ekodrix-auth - Check session validity
 */
export async function GET() {
    try {
        const decoded = await verifyEkodrixAuth()
        return NextResponse.json({ authenticated: true, user: decoded.user })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Session invalid'
        return NextResponse.json(
            { authenticated: false, message },
            { status: 401 }
        )
    }
}

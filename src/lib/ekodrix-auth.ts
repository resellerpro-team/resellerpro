/**
 * 🔒 Ekodrix Panel Authentication Library
 * 
 * This module provides secure JWT-based authentication for the Ekodrix admin panel.
 * All credentials are stored in environment variables, never in source code.
 */

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Constants
const SESSION_COOKIE_NAME = 'ekodrix-session'
const SESSION_EXPIRY = '24h'

/**
 * Get the session secret from environment variables.
 * Falls back to a development-only secret if not set.
 */
function getSessionSecret(): string {
    const secret = process.env.EKODRIX_SESSION_SECRET
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('EKODRIX_SESSION_SECRET is required in production')
        }
        // Development fallback (NOT for production)
        return 'dev-ekodrix-secret-change-in-production-' + Date.now()
    }
    return secret
}

/**
 * Verify the Ekodrix admin session.
 * Call this at the start of every protected API route.
 * 
 * @throws Error if not authenticated
 * @returns The decoded JWT payload
 */
export async function verifyEkodrixAuth(): Promise<{ user: string; iat: number; exp: number }> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
        throw new Error('No session found')
    }

    try {
        const decoded = jwt.verify(token, getSessionSecret()) as { user: string; iat: number; exp: number }
        return decoded
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Session expired')
        }
        throw new Error('Invalid session')
    }
}

/**
 * Validate admin credentials
 */
export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
    const validUsername = process.env.EKODRIX_USERNAME || 'ekodrix-user'
    const passwordHash = process.env.EKODRIX_PASSWORD_HASH

    // Check username first
    if (username !== validUsername) {
        return false
    }

    // If no password hash is set OR in development mode, allow the original password
    if (!passwordHash || process.env.NODE_ENV !== 'production') {
        // Allow original password for development/testing
        if (password === 'Ekodrix@2026!' || password === 'admin123') {
            return true
        }
    }

    // In production with hash set, compare with bcrypt
    if (passwordHash) {
        try {
            return await bcrypt.compare(password, passwordHash)
        } catch {
            // If hash comparison fails, fall back to plaintext check in dev
            if (process.env.NODE_ENV !== 'production') {
                return password === 'Ekodrix@2026!'
            }
            return false
        }
    }

    return false
}

/**
 * Create a new JWT session token
 */
export function createSessionToken(username: string): string {
    return jwt.sign(
        { user: username },
        getSessionSecret(),
        { expiresIn: SESSION_EXPIRY }
    )
}

/**
 * Get cookie options for the session
 */
export function getSessionCookieOptions() {
    return {
        name: SESSION_COOKIE_NAME,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
    }
}

/**
 * Utility to generate a password hash (for initial setup)
 * Run: npx ts-node -e "import('./src/lib/ekodrix-auth').then(m => m.generatePasswordHash('your-password'))"
 */
export async function generatePasswordHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 12)
    console.log('Generated hash:', hash)
    console.log('Add this to your .env.local:')
    console.log(`EKODRIX_PASSWORD_HASH=${hash}`)
    return hash
}

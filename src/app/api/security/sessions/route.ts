import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple hash function for session tokens (must match tracker utility)
async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// GET: Fetch all active sessions for current user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { session } } = await supabase.auth.getSession()
        const currentTokenHash = session ? await hashToken(session.access_token) : null

        const { data: sessions, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('login_success', true)
            .order('last_active', { ascending: false })

        if (error) throw error

        // 🩺 SELF-HEALING: If no sessions found or current session missing, track it now
        if (session) {
            const { trackSession } = await import('@/lib/security/session-tracker')
            const hdrs = await (await import('next/headers')).headers()
            const ip = hdrs.get('x-forwarded-for')?.split(',')[0] || hdrs.get('x-real-ip') || 'unknown'
            const userAgent = hdrs.get('user-agent') || 'Unknown'

            if (!sessions || sessions.length === 0) {
                await trackSession({
                    userId: user.id,
                    sessionToken: session.access_token,
                    ipAddress: ip,
                    userAgent: userAgent,
                    isCurrent: true
                })

                // Re-fetch sessions after tracking
                const { data: updatedSessions } = await supabase
                    .from('user_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('login_success', true)
                    .order('last_active', { ascending: false })

                const finalSessions = (updatedSessions || []).map(s => ({
                    ...s,
                    is_current: s.session_token === currentTokenHash
                }))

                return NextResponse.json({
                    success: true,
                    sessions: finalSessions
                })
            }
        }

        // Map sessions to accurately identify current device by token hash
        const finalSessions = (sessions || []).map(s => ({
            ...s,
            is_current: s.session_token === currentTokenHash
        }))

        return NextResponse.json({
            success: true,
            sessions: finalSessions
        })
    } catch (error: any) {
        console.error('Get sessions error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE: Revoke a specific session
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('user_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id) // Security: Ensure user owns this session

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'Session revoked successfully'
        })
    } catch (error: any) {
        console.error('Revoke session error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

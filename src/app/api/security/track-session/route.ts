import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * POST: Track a new session after successful login
 * This endpoint is called from the client-side (e.g. auth callback)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'No active session' }, { status: 401 })
        }

        const headersList = await headers()
        const body = await request.json().catch(() => ({}))

        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            'Unknown'

        const userAgent = body.userAgent || headersList.get('user-agent') || 'Unknown'
        const deviceName = body.deviceName || null

        // Use the unified tracking utility for consistency
        const { trackSession } = await import('@/lib/security/session-tracker')

        await trackSession({
            userId: user.id,
            sessionToken: session.access_token,
            ipAddress: ip,
            userAgent: userAgent,
            deviceName: deviceName,
            isCurrent: true
        })

        return NextResponse.json({
            success: true,
            message: 'Session tracked successfully'
        })
    } catch (error: any) {
        console.error('Track session error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

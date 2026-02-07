import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: Fetch security preferences
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: preferences, error } = await supabase
            .from('security_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // If no preferences exist, create defaults (safe upsert)
        let finalPreferences = preferences
        if (!preferences) {
            const { data: newPrefs, error: upsertError } = await supabase
                .from('security_preferences')
                .upsert({ user_id: user.id }, { onConflict: 'user_id' })
                .select()
                .single()

            if (upsertError) throw upsertError
            finalPreferences = newPrefs
        }

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

        return NextResponse.json({
            success: true,
            preferences: finalPreferences || {
                email_on_new_login: true,
                email_on_password_change: true,
                email_on_suspicious_activity: true,
                weekly_security_summary: false,
                two_factor_enabled: false
            }
        })
    } catch (error: any) {
        console.error('Get security preferences error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH: Update security preferences
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const updates = {
            email_on_new_login: body.email_on_new_login,
            email_on_password_change: body.email_on_password_change,
            email_on_suspicious_activity: body.email_on_suspicious_activity,
            weekly_security_summary: body.weekly_security_summary,
            updated_at: new Date().toISOString()
        }

        // Remove undefined values
        Object.keys(updates).forEach(key => {
            if (updates[key as keyof typeof updates] === undefined) {
                delete updates[key as keyof typeof updates]
            }
        })

        const { data, error } = await supabase
            .from('security_preferences')
            .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Preferences record not found' }, { status: 404 })
            throw error
        }

        return NextResponse.json({
            success: true,
            preferences: data
        })
    } catch (error: any) {
        console.error('Update security preferences error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

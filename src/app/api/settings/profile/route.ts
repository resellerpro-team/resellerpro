import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows returned" if profile doesn't exist yet
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Combine user auth data with profile data
    const userData = {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
        business_name: profile?.business_name || '',
        created_at: user.created_at,
    }

    return NextResponse.json(userData)
}

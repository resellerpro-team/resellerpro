import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with referral code
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, full_name')
        .eq('id', user.id)
        .single()

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Get referrals where user is the referrer
    const { data: referralsData, error: referralError } = await supabase
        .from('referrals')
        .select(`
      id,
      status,
      created_at,
      referee:profiles!referrals_referee_id_fkey(full_name)
    `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

    if (referralError) {
        return NextResponse.json({ error: referralError.message }, { status: 500 })
    }

    const referrals = (referralsData || []).map((r: any) => ({
        id: r.id,
        referee_name: r.referee?.full_name || 'User',
        status: r.status,
        created_at: r.created_at,
    }))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const referralLink = `${baseUrl}/signup?ref=${profile.referral_code}`

    return NextResponse.json({
        referralCode: profile.referral_code,
        referralLink,
        referrals,
    })
}

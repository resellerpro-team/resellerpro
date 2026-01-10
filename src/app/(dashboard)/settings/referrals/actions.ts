'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReferralData() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get user profile with referral code
    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, full_name')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    // Get referrals where user is the referrer
    const { data: referralsData } = await supabase
        .from('referrals')
        .select(`
      id,
      status,
      created_at,
      referee:profiles!referrals_referee_id_fkey(full_name)
    `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

    const referrals = (referralsData || []).map((r: any) => {
        console.log("referral data: ", r);
        return ({
            id: r.id,
            referee_name: r.referee?.full_name || 'User',
            status: r.status,
            created_at: r.created_at,
        })
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const referralLink = `${baseUrl}/signup?ref=${profile.referral_code}`

    return {
        referralCode: profile.referral_code,
        referralLink,
        referrals,
    }
}

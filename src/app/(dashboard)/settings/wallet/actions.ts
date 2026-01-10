'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWalletData() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get wallet balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    // Get wallet transactions (NO extra logic)
    const { data: transactionsData } = await supabase
        .from('wallet_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const transactions = (transactionsData || []).map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description, // ✅ backend-controlled
        created_at: t.created_at,
    }))

    return {
        balance: Number(profile.wallet_balance),
        transactions,
    }
}

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

    // Get wallet transactions
    const { data: transactionsData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const transactions = (transactionsData || []).map((t) => ({
        id: t.id,
        amount: parseFloat(t.amount),
        type: t.type,
        description: t.description,
        created_at: t.created_at,
    }))

    return {
        balance: parseFloat(profile.wallet_balance || 0),
        transactions,
    }
}

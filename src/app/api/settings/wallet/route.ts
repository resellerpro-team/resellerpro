import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get wallet balance
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Get wallet transactions
    const { data: transactionsData, error: transError } = await supabase
        .from('wallet_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (transError) {
        return NextResponse.json({ error: transError.message }, { status: 500 })
    }

    const transactions = (transactionsData || []).map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        created_at: t.created_at,
    }))

    return NextResponse.json({
        balance: Number(profile.wallet_balance),
        transactions,
    })
}

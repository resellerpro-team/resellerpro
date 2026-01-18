import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Stock Status Counts
        const inStockPromise = supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stock_status', 'in_stock')
        const lowStockPromise = supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stock_status', 'low_stock')
        const outStockPromise = supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stock_status', 'out_of_stock')

        // 2. Financials (Fetch minimal columns)
        // We need selling_price, cost_price, stock_quantity to calculate Value and Profit
        const financialsPromise = supabase
            .from('products')
            .select('selling_price, cost_price, stock_quantity')
            .eq('user_id', user.id)

        const [inStockRes, lowStockRes, outStockRes, financialsRes] = await Promise.all([
            inStockPromise,
            lowStockPromise,
            outStockPromise,
            financialsPromise
        ])

        if (financialsRes.error) throw financialsRes.error

        const products = financialsRes.data || []

        const totalValue = products.reduce((acc, p) => acc + (p.selling_price * (p.stock_quantity || 0)), 0)
        const totalProfit = products.reduce((acc, p) => acc + ((p.selling_price - p.cost_price) * (p.stock_quantity || 0)), 0)

        // Avg Margin
        const avgMargin = products.length === 0 ? 0 : (
            products.reduce((acc, p) => {
                const margin = p.selling_price ? ((p.selling_price - p.cost_price) / p.selling_price) * 100 : 0
                return acc + margin
            }, 0) / products.length
        )

        return NextResponse.json({
            inStock: inStockRes.count || 0,
            lowStock: lowStockRes.count || 0,
            outOfStock: outStockRes.count || 0,
            totalValue,
            totalProfit,
            avgMargin: parseFloat(avgMargin.toFixed(1))
        })

    } catch (error: any) {
        console.error('Products Stats API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

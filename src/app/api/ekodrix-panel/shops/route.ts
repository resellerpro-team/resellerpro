import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await verifyEkodrixAuth()
        const supabase = await createAdminClient()

        // Get all profiles that have a shop_slug set (i.e. configured a store)
        const { data: shopProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, business_name, shop_slug, shop_description, shop_theme, avatar_url, updated_at')
            .not('shop_slug', 'is', null)
            .neq('shop_slug', '')
            .order('updated_at', { ascending: false })

        if (profilesError) throw profilesError

        // Get ALL profiles count for reference
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // Get subscription data for each shop user
        const shopUserIds = shopProfiles?.map(p => p.id) || []
        const subscriptionMap = new Map<string, any>()
        const productCountMap = new Map<string, number>()

        if (shopUserIds.length > 0) {
            // Fetch subscriptions
            const { data: subscriptions } = await supabase
                .from('user_subscriptions')
                .select('user_id, status, current_period_end, plan:subscription_plans(name, display_name)')
                .in('user_id', shopUserIds)

            subscriptions?.forEach(sub => {
                subscriptionMap.set(sub.user_id, sub)
            })

            // Fetch product counts per user
            const { data: products } = await supabase
                .from('products')
                .select('user_id')
                .in('user_id', shopUserIds)

            products?.forEach(p => {
                productCountMap.set(p.user_id, (productCountMap.get(p.user_id) || 0) + 1)
            })
        }

        // Get free plan ID
        const { data: freePlanData } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()
        const freePlanId = freePlanData?.id

        // Classify shops
        const shops = (shopProfiles || []).map(profile => {
            const sub = subscriptionMap.get(profile.id)
            const planName = (Array.isArray(sub?.plan) ? sub.plan[0]?.name : sub?.plan?.name)?.toLowerCase() || 'free'
            const planDisplay = (Array.isArray(sub?.plan) ? sub.plan[0]?.display_name : sub?.plan?.display_name) || 'Free'
            const isEligible = ['professional', 'business'].includes(planName)
            const productCount = productCountMap.get(profile.id) || 0

            return {
                id: profile.id,
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                business_name: profile.business_name,
                shop_slug: profile.shop_slug,
                shop_description: profile.shop_description,
                shop_theme: profile.shop_theme,
                avatar_url: profile.avatar_url,
                updated_at: profile.updated_at,
                plan_name: planName,
                plan_display: planDisplay,
                subscription_status: sub?.status || 'none',
                subscription_end: sub?.current_period_end || null,
                is_eligible: isEligible,
                product_count: productCount,
                store_url: `/${profile.shop_slug}`,
                status: isEligible ? 'live' : 'locked',
            }
        })

        // Summary stats
        const liveStores = shops.filter(s => s.is_eligible).length
        const lockedStores = shops.filter(s => !s.is_eligible).length
        const totalConfigured = shops.length
        const totalProducts = [...productCountMap.values()].reduce((s, c) => s + c, 0)
        const noStoreSetup = (totalUsers || 0) - totalConfigured

        // Get users who have NOT set up a shop yet (top 10 most recent)
        const { data: noShopUsers } = await supabase
            .from('profiles')
            .select('id, full_name, email, business_name, updated_at')
            .or('shop_slug.is.null,shop_slug.eq.')
            .order('updated_at', { ascending: false })
            .limit(10)

        // Get subscriptions for noShopUsers to identify potential upsell targets
        let noShopEnriched: any[] = []
        if (noShopUsers && noShopUsers.length > 0) {
            const noShopIds = noShopUsers.map(u => u.id)
            const { data: noShopSubs } = await supabase
                .from('user_subscriptions')
                .select('user_id, plan:subscription_plans(name, display_name)')
                .in('user_id', noShopIds)

            const noShopSubMap = new Map<string, any>()
            noShopSubs?.forEach(s => noShopSubMap.set(s.user_id, s))

            noShopEnriched = noShopUsers.map(u => {
                const sub = noShopSubMap.get(u.id)
                const planName = (Array.isArray(sub?.plan) ? sub.plan[0]?.name : sub?.plan?.name)?.toLowerCase() || 'free'
                const planDisplay = (Array.isArray(sub?.plan) ? sub.plan[0]?.display_name : sub?.plan?.display_name) || 'Free'
                return {
                    ...u,
                    plan_name: planName,
                    plan_display: planDisplay,
                    is_eligible: ['professional', 'business'].includes(planName),
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalUsers: totalUsers || 0,
                    totalConfigured,
                    liveStores,
                    lockedStores,
                    noStoreSetup,
                    totalProducts,
                    adoptionRate: totalUsers ? Math.round((totalConfigured / totalUsers) * 100) : 0,
                    eligibilityRate: totalConfigured > 0 ? Math.round((liveStores / totalConfigured) * 100) : 0,
                },
                shops,
                noShopUsers: noShopEnriched,
            },
        })
    } catch (error: any) {
        console.error('Shop stores error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

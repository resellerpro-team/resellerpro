'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/analytics/DateRangePicker'
import { SalesProfitChart } from '@/components/analytics/SalesProfitChart'
import { RevenueByCategoryChart } from '@/components/analytics/RevenueByCategoryChart'
import { PaymentStatusChart } from '@/components/analytics/PaymentStatusChart'
import { OrderStatusChart } from '@/components/analytics/OrderStatusChart'
import { ExportButton } from '@/components/analytics/ExportButton'
import { LockedChart } from '@/components/analytics/LockedChart'
import { FreePlanBanner } from '@/components/analytics/FreePlanBanner'
import {
    IndianRupee,
    ShoppingCart,
    Users,
    TrendingUp,
    Package,
    ArrowRight,
    User,
    Percent,
    Clock,
    Loader2,
    Crown,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { format, subDays } from 'date-fns'
import { useAnalytics } from '@/lib/react-query/hooks/useAnalytics'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { AnalyticsSkeleton } from '@/components/shared/skeletons/AnalyticsSkeleton'
import { motion } from 'framer-motion'

export function AnalyticsClient() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

    // Free users: max 7 days, Premium: unlimited
    const FREE_PLAN_MAX_DAYS = 7

    // Don't even read URL params until we know subscription status
    const [actualFrom, setActualFrom] = useState<string | undefined>(undefined)
    const [actualTo, setActualTo] = useState<string | undefined>(undefined)
    const [isReady, setIsReady] = useState(false)

    // Calculate dates ONLY after subscription check completes
    useEffect(() => {
        if (isCheckingSubscription) {
            setIsReady(false)
            return
        }

        const urlFrom = searchParams.get('from') || undefined
        const urlTo = searchParams.get('to') || undefined

        if (isPremium) {
            setActualFrom(urlFrom)
            setActualTo(urlTo)
            setIsReady(true)
        } else {
            const today = new Date()
            const limitDate = subDays(today, FREE_PLAN_MAX_DAYS)
            const restrictedFrom = limitDate.toISOString().split('T')[0]
            const restrictedTo = today.toISOString().split('T')[0]

            setActualFrom(restrictedFrom)
            setActualTo(restrictedTo)
            setIsReady(true)

            if (urlFrom !== restrictedFrom || urlTo !== restrictedTo) {
                const params = new URLSearchParams(searchParams.toString())
                params.set('from', restrictedFrom)
                params.set('to', restrictedTo)
                router.replace(`/analytics?${params.toString()}`)
            }
        }
    }, [isCheckingSubscription, isPremium, searchParams, router])

    const [businessName, setBusinessName] = useState<string>('ResellerPro')

    useEffect(() => {
        async function fetchBusinessName() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('business_name')
                    .eq('id', user.id)
                    .single()

                if (profile?.business_name) {
                    setBusinessName(profile.business_name)
                }
            }
        }

        fetchBusinessName()
    }, [])

    const { data, isLoading, error } = useAnalytics(
        { from: actualFrom, to: actualTo },
        { enabled: isReady }
    )

    if (isCheckingSubscription || !isReady || isLoading) {
        return <AnalyticsSkeleton />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-destructive font-medium">Error loading analytics data</p>
            </div>
        )
    }

    const { orders = [], stats, topProducts = [], topCustomers = [], dateRanges } = data || {}

    const safeStats = stats || {
        currentRevenue: 0,
        currentProfit: 0,
        profitMargin: 0,
        currentOrderCount: 0,
        currentAvgOrderValue: 0,
        pendingOrdersValue: 0,
        revenueChange: '0%',
        profitChange: '0%',
        orderCountChange: '0',
        avgOrderValueChange: '0%',
        profitMarginChange: '0%',
    }

    const maxProductRevenue = topProducts[0]?.revenue || 1
    const maxCustomerSpending = topCustomers[0]?.spending || 1

    return (
        <div className="space-y-8 pb-10">
            {/* Header - Compact & Responsive */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                            Business Health
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Calendar className="w-4 h-4" />
                            <p className="text-sm">
                                {dateRanges?.hasFilter && actualFrom && actualTo
                                    ? `${format(new Date(actualFrom), 'MMM dd')} - ${format(new Date(actualTo), 'MMM dd, yyyy')}`
                                    : 'Performance Overview'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:self-end">
                        <DateRangePicker disabled={!isPremium} />
                        <ExportButton
                            orders={orders}
                            dateRange={{ from: actualFrom, to: actualTo }}
                            businessName={businessName}
                        />
                    </div>
                </div>
            </div>

            {/* Free Plan Banner */}
            {!isCheckingSubscription && !isPremium && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <FreePlanBanner daysLimit={FREE_PLAN_MAX_DAYS} showingDays={FREE_PLAN_MAX_DAYS} />
                </motion.div>
            )}

            {/* Key Metrics Grid - 2 cols on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatsCard
                    title="Revenue"
                    value={`₹${Math.round(safeStats.currentRevenue).toLocaleString('en-IN')}`}
                    change={safeStats.revenueChange}
                    label={dateRanges?.periodLabel}
                    icon={IndianRupee}
                    gradient="from-blue-600/10 to-indigo-600/10"
                    trend={safeStats.revenueChange.startsWith('+') ? 'up' : safeStats.revenueChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Profit"
                    value={`₹${Math.round(safeStats.currentProfit).toLocaleString('en-IN')}`}
                    change={safeStats.profitChange}
                    label={dateRanges?.periodLabel}
                    icon={TrendingUp}
                    gradient="from-emerald-600/10 to-teal-600/10"
                    trend={safeStats.profitChange.startsWith('+') ? 'up' : safeStats.profitChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Margin"
                    value={`${safeStats.profitMargin.toFixed(1)}%`}
                    change={safeStats.profitMarginChange}
                    label={dateRanges?.periodLabel}
                    icon={Percent}
                    gradient="from-purple-600/10 to-pink-600/10"
                    trend={safeStats.profitMarginChange.startsWith('+') ? 'up' : safeStats.profitMarginChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Orders"
                    value={safeStats.currentOrderCount.toString()}
                    change={safeStats.orderCountChange}
                    label={dateRanges?.periodLabel}
                    icon={ShoppingCart}
                    trend={safeStats.orderCountChange.startsWith('+') ? 'up' : safeStats.orderCountChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Avg value"
                    value={`₹${Math.round(safeStats.currentAvgOrderValue).toLocaleString('en-IN')}`}
                    change={safeStats.avgOrderValueChange}
                    label={dateRanges?.periodLabel}
                    trend={safeStats.avgOrderValueChange.startsWith('+') ? 'up' : safeStats.avgOrderValueChange.startsWith('-') ? 'down' : 'neutral'}
                    icon={Users}
                />
                <StatsCard
                    title="Pipeline"
                    value={`₹${Math.round(safeStats.pendingOrdersValue).toLocaleString('en-IN')}`}
                    change={`${orders.filter((o: any) => o.status === 'pending').length} pending`}
                    icon={Clock}
                    trend="neutral"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-3xl">
                    <CardHeader className="p-6 sm:p-8">
                        <CardTitle className="text-xl font-bold">Sales & Profit Trend</CardTitle>
                        <CardDescription>Performance trajectories over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] sm:h-[400px] p-2 sm:p-6 pt-0">
                        <SalesProfitChart
                            orders={orders}
                            dateRange={{
                                from: dateRanges?.hasFilter && actualFrom ? actualFrom : new Date(new Date().setDate(new Date().getDate() - 29)).toISOString(),
                                to: dateRanges?.hasFilter && actualTo ? actualTo : new Date().toISOString()
                            }}
                        />
                    </CardContent>
                </Card>

                {isPremium ? (
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-3xl">
                        <CardHeader className="p-6 sm:p-8">
                            <CardTitle className="text-xl font-bold">Revenue by Category</CardTitle>
                            <CardDescription>Top category performance</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] sm:h-[400px] p-2 sm:p-6 pt-0">
                            <RevenueByCategoryChart orders={orders} />
                        </CardContent>
                    </Card>
                ) : (
                    <LockedChart
                        title="Revenue by Category"
                        description="See category performance breakdown"
                        chartType="bar"
                    />
                )}
            </div>

            {/* Top Performers */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TopPerformersCard
                    title="Top Selling Products"
                    description="Best performers in your catalog"
                    icon={Package}
                    items={topProducts.length > 0 ? topProducts.map((p: any) => ({
                        name: p.name,
                        value: `₹${p.revenue.toLocaleString('en-IN')} (${p.quantity})`,
                        progress: Math.round((p.revenue / maxProductRevenue) * 100)
                    })) : [{ name: 'No data', value: '₹0', progress: 0 }]}
                    viewAllHref="/products"
                />

                <TopPerformersCard
                    title="Top Customers"
                    description="Your most valuable partners"
                    icon={User}
                    items={topCustomers.length > 0 ? (isPremium ? topCustomers : topCustomers.slice(0, 5)).map((c: any) => ({
                        name: c.name,
                        value: `₹${c.spending.toLocaleString('en-IN')} (${c.orderCount})`,
                        progress: Math.round((c.spending / maxCustomerSpending) * 100)
                    })) : [{ name: 'No data', value: '₹0', progress: 0 }]}
                    viewAllHref="/customers"
                    showUpgradeCTA={!isPremium && topCustomers.length > 5}
                    totalCount={topCustomers.length}
                />
            </div>
        </div>
    )
}

function StatsCard({
    title,
    value,
    change,
    label,
    icon: Icon,
    trend = 'up',
    gradient = "from-slate-500/5 to-slate-900/5"
}: {
    title: string
    value: string
    change: string
    label?: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
    gradient?: string
}) {
    return (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-3xl relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                    <Icon className="h-3.5 w-3.5 text-slate-600" />
                </div>
            </CardHeader>
            <CardContent className="relative space-y-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{value}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                        trend === 'down' ? 'bg-red-50 text-red-600' :
                            'bg-slate-50 text-slate-500'
                        }`}>
                        {trend === 'up' && <ArrowUpRight className="w-2.5 h-2.5" />}
                        {trend === 'down' && <ArrowDownRight className="w-2.5 h-2.5" />}
                        {change}
                    </div>
                    {label && <span className="text-[10px] font-bold text-slate-400 truncate max-w-[50px]">{label}</span>}
                </div>
            </CardContent>
        </Card>
    )
}

function TopPerformersCard({
    title,
    description,
    icon: Icon,
    items,
    viewAllHref,
    showUpgradeCTA = false,
    totalCount = 0,
}: {
    title: string
    description: string
    icon: any
    items: { name: string; value: string; progress: number }[]
    viewAllHref: string
    showUpgradeCTA?: boolean
    totalCount?: number
}) {
    const router = useRouter()

    return (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-4 p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-8 space-y-5">
                {items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="group">
                        <div className="flex justify-between text-sm mb-2 px-1">
                            <span className="font-bold text-slate-700 truncate max-w-[200px]">{item.name}</span>
                            <span className="text-slate-400 text-xs font-semibold">{item.value}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    {showUpgradeCTA ? (
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl font-bold border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 shadow-sm"
                            onClick={() => router.push('/settings/subscription#pricing')}
                        >
                            <Crown className="mr-2 h-4 w-4 fill-amber-400 text-amber-500" />
                            Unlock {totalCount - 5} More {title.split(' ').pop()}
                        </Button>
                    ) : (
                        <Button variant="secondary" className="w-full h-12 rounded-2xl font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50" asChild>
                            <Link href={viewAllHref}>
                                View Detailed List <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

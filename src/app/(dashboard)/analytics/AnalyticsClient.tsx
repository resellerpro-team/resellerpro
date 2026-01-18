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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { format, subDays } from 'date-fns'
import { useAnalytics } from '@/lib/react-query/hooks/useAnalytics'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { AnalyticsSkeleton } from '@/components/shared/skeletons/AnalyticsSkeleton'

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
            // Still checking, don't do anything
            setIsReady(false)
            return
        }
        
        // Subscription status is known
        const urlFrom = searchParams.get('from') || undefined
        const urlTo = searchParams.get('to') || undefined
        
        if (isPremium) {
            // Premium: use whatever dates from URL (or undefined for all-time)
            setActualFrom(urlFrom)
            setActualTo(urlTo)
            setIsReady(true)
        } else {
            // Free: force 7 days
            const today = new Date()
            const limitDate = subDays(today, FREE_PLAN_MAX_DAYS)
            const restrictedFrom = limitDate.toISOString().split('T')[0]
            const restrictedTo = today.toISOString().split('T')[0]
            
            setActualFrom(restrictedFrom)
            setActualTo(restrictedTo)
            setIsReady(true)
            
            // Update URL if needed
            if (urlFrom !== restrictedFrom || urlTo !== restrictedTo) {
                const params = new URLSearchParams(searchParams.toString())
                params.set('from', restrictedFrom)
                params.set('to', restrictedTo)
                router.replace(`/analytics?${params.toString()}`)
            }
        }
    }, [isCheckingSubscription, isPremium, searchParams, router])

    const [businessName, setBusinessName] = useState<string>('ResellerPro')

    // Fetch business name from user profile
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

    // ONLY fetch analytics when we're ready (subscription known + dates calculated)
    const { data, isLoading, error } = useAnalytics(
        { from: actualFrom, to: actualTo },
        { enabled: isReady }  // Don't fetch until ready
    )
    
    // Show loading while checking subscription OR fetching data
    if (isCheckingSubscription || !isReady || isLoading) {
        return <AnalyticsSkeleton />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-destructive">Error loading analytics data</p>
            </div>
        )
    }

    const { orders = [], stats, topProducts = [], topCustomers = [], dateRanges } = data || {}

    // Provide fallback stats if API returns undefined (though it shouldn't)
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

    // Calculate helpers for charts (re-calculating Max for progress bars)
    const maxProductRevenue = topProducts[0]?.revenue || 1
    const maxCustomerSpending = topCustomers[0]?.spending || 1

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-muted-foreground">
                        {dateRanges?.hasFilter && actualFrom && actualTo
                            ? `Showing data from ${format(new Date(actualFrom), 'MMM dd, yyyy')} to ${format(new Date(actualTo), 'MMM dd, yyyy')}`
                            : 'Showing all time data'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton
                        orders={orders}
                        dateRange={{ from: actualFrom, to: actualTo }}
                        businessName={businessName}
                    />
                    <DateRangePicker disabled={!isPremium} />
                </div>
            </div>
            
            {/* Free Plan Banner */}
            {!isCheckingSubscription && !isPremium && (
                <FreePlanBanner daysLimit={FREE_PLAN_MAX_DAYS} showingDays={FREE_PLAN_MAX_DAYS} />
            )}

            {/* Key Metrics - 6 Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${safeStats.currentRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    change={`${safeStats.revenueChange} ${dateRanges?.periodLabel || ''}`}
                    icon={IndianRupee}
                    trend={safeStats.revenueChange.startsWith('+') ? 'up' : safeStats.revenueChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Total Profit"
                    value={`₹${safeStats.currentProfit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    change={`${safeStats.profitChange} ${dateRanges?.periodLabel || ''}`}
                    icon={TrendingUp}
                    trend={safeStats.profitChange.startsWith('+') ? 'up' : safeStats.profitChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Profit Margin"
                    value={`${safeStats.profitMargin.toFixed(1)}%`}
                    change={`${safeStats.profitMarginChange} ${dateRanges?.periodLabel || ''}`}
                    icon={Percent}
                    trend={safeStats.profitMarginChange.startsWith('+') ? 'up' : safeStats.profitMarginChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Total Orders"
                    value={safeStats.currentOrderCount.toString()}
                    change={`${safeStats.orderCountChange} ${dateRanges?.periodLabel || ''}`}
                    icon={ShoppingCart}
                    trend={safeStats.orderCountChange.startsWith('+') ? 'up' : safeStats.orderCountChange.startsWith('-') ? 'down' : 'neutral'}
                />
                <StatsCard
                    title="Avg. Order Value"
                    value={`₹${safeStats.currentAvgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    change={`${safeStats.avgOrderValueChange} ${dateRanges?.periodLabel || ''}`}
                    trend={safeStats.avgOrderValueChange.startsWith('+') ? 'up' : safeStats.avgOrderValueChange.startsWith('-') ? 'down' : 'neutral'}
                    icon={Users}
                />
                <StatsCard
                    title="Pending Orders Value"
                    value={`₹${safeStats.pendingOrdersValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    change={`${orders.filter((o: any) => o.status === 'pending').length} orders`}
                    icon={Clock}
                    trend="neutral"
                />
            </div>

            {/* Charts Grid - 4 Charts in 2 rows */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Profit Trend</CardTitle>
                        <CardDescription>
                            {dateRanges?.hasFilter
                                ? 'Daily performance over the selected period'
                                : 'Performance over last 30 days'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <SalesProfitChart
                            orders={orders}
                            dateRange={{
                                from: dateRanges?.hasFilter && actualFrom ? actualFrom : new Date(new Date().setDate(new Date().getDate() - 29)).toISOString(),
                                to: dateRanges?.hasFilter && actualTo ? actualTo : new Date().toISOString()
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Category</CardTitle>
                        <CardDescription>
                            {dateRanges?.hasFilter
                                ? 'Top 10 categories in selected period'
                                : 'All time top 10 categories'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <RevenueByCategoryChart orders={orders} />
                    </CardContent>
                </Card>

                {isPremium ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status Breakdown</CardTitle>
                            <CardDescription>
                                Distribution of payment statuses
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <PaymentStatusChart orders={orders} />
                        </CardContent>
                    </Card>
                ) : (
                    <LockedChart
                        title="Payment Status Breakdown"
                        description="See detailed payment analytics"
                        chartType="donut"
                    />
                )}

                {isPremium ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Fulfillment Status</CardTitle>
                            <CardDescription>
                                Current order processing pipeline
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <OrderStatusChart orders={orders} />
                        </CardContent>
                    </Card>
                ) : (
                    <LockedChart
                        title="Order Fulfillment Status"
                        description="Track your order pipeline in real-time"
                        chartType="bar"
                    />
                )}
            </div>

            {/* Top Performers Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                <TopPerformersCard
                    title="Top Selling Products"
                    description={dateRanges?.hasFilter ? 'Best performers in selected period' : 'All time best performers'}
                    icon={Package}
                    items={topProducts.length > 0 ? topProducts.map((p: any) => ({
                        name: p.name,
                        value: `₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${p.quantity} sold)`,
                        progress: Math.round((p.revenue / maxProductRevenue) * 100)
                    })) : [{ name: 'No data available', value: '₹0', progress: 0 }]}
                    viewAllHref="/products"
                />

                <TopPerformersCard
                    title="Top Customers"
                    description={dateRanges?.hasFilter ? 'Top spenders in selected period' : 'All time top spenders'}
                    icon={User}
                    items={topCustomers.length > 0 ? (isPremium ? topCustomers : topCustomers.slice(0, 5)).map((c: any) => ({
                        name: c.name,
                        value: `₹${c.spending.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${c.orderCount} orders)`,
                        progress: Math.round((c.spending / maxCustomerSpending) * 100)
                    })) : [{ name: 'No data available', value: '₹0', progress: 0 }]}
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
    icon: Icon,
    trend = 'up',
}: {
    title: string
    value: string
    change: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p
                    className={`text-xs ${trend === 'up'
                        ? 'text-green-600'
                        : trend === 'down'
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                        }`}
                >
                    {change}
                </p>
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
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div key={`${item.name}-${index}`}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium truncate mr-2">{item.name}</span>
                            <span className="text-muted-foreground text-xs whitespace-nowrap">{item.value}</span>
                        </div>
                        <Progress value={item.progress} />
                    </div>
                ))}
                
                {showUpgradeCTA ? (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-800"
                        onClick={() => router.push('/settings/subscription')}
                    >
                        <Crown className="mr-2 h-4 w-4 text-amber-600" />
                        Unlock {totalCount - 5} More
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={viewAllHref}>
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, CreditCard, IndianRupee, TrendingUp, TrendingDown,
  ShoppingCart, MessageSquare, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
  Activity, Zap, ChevronRight, Search, ExternalLink,
  BarChart3, Star, Package, Shield, Eye, UserPlus,
  Percent, CalendarDays, Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { KpiCard } from '@/components/admin/kpi-card'
import { StatusBadge } from '@/components/admin/status-badge'

interface TopUser {
  id: string
  full_name: string
  email: string
  phone: string
  business_name: string
  orders_count: number
  enquiries_count: number
  revenue: number
  last_seen: string | null
  engagement_score: number
}

interface ExpiringAlert {
  user_id: string
  full_name: string
  email: string
  plan: string
  expires_at: string
  days_left: number
}

interface DashboardData {
  metrics: {
    totalUsers: number
    activeSubscriptions: number
    totalRevenue: number
    monthRevenue: number
    prevMonthRevenue: number
    mrr: number
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    newUsersPrevMonth: number
    expiringCount: number
    churnRate: number
    totalOrders: number
    totalProducts: number
    pendingEnquiries: number
    revenueGrowth: number
    userGrowth: number
    activeUsersHighlights: number
    freeUsers: number
    proUsers: number
    avgUseTime: number
  }
  activeUsers: Array<{ id: string; full_name: string; email: string; updated_at: string }>
  recentUsers: Array<{ id: string; full_name: string; email: string; phone: string; business_name: string; updated_at: string }>
  recentTransactions: Array<{ id: string; amount: number; status: string; created_at: string; user_id: string; profile?: { full_name: string; email: string } }>
  planDistribution: Record<string, number>
  topUsers: TopUser[]
  signupTrend: Array<{ date: string; count: number }>
  revenueTrend: Array<{ date: string; amount: number }>
  expiringAlerts: ExpiringAlert[]
}

export default function EkodrixDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeUsersOpen, setActiveUsersOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/ekodrix-panel/stats')
      const result = await response.json()
      if (result.success) setData(result.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <p className="text-gray-500 animate-pulse text-sm">Synchronizing live data...</p>
      </div>
    )
  }

  const m = data?.metrics || {} as DashboardData['metrics']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time business intelligence & user behavior analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-400 bg-emerald-500/5 animate-pulse">
            Live · Auto-refreshes
          </Badge>
          <Button onClick={() => { setRefreshing(true); fetchData() }} variant="outline" size="sm"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 group" disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* ═══════════════ KPI CARDS — ROW 1 ═══════════════ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Customers" value={m.totalUsers || 0} icon={Users}
          gradient="from-blue-500 to-indigo-600"
          trend={m.userGrowth > 0 ? 'up' : m.userGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${m.userGrowth > 0 ? '+' : ''}${m.userGrowth || 0}% MoM`}
          subtitle={`${m.newUsersToday || 0} today · ${m.newUsersThisWeek || 0} this week`}
          delay={0} />
        <KpiCard title="Active Users (24h)" value={m.activeUsersHighlights || 0} icon={Activity}
          gradient="from-emerald-500 to-teal-500"
          trend="up" subtitle="Click for details"
          onClick={() => setActiveUsersOpen(true)} delay={1} />
        <KpiCard title="MRR (Monthly Recurring)" value={`₹${(m.mrr || 0).toLocaleString('en-IN')}`} icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
          trend={m.revenueGrowth > 0 ? 'up' : m.revenueGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${m.revenueGrowth > 0 ? '+' : ''}${m.revenueGrowth || 0}%`}
          subtitle={`Total: ₹${(m.totalRevenue || 0).toLocaleString('en-IN')}`} delay={2} />
        <KpiCard title="Churn Rate" value={`${m.churnRate || 0}%`} icon={Percent}
          gradient={m.churnRate > 10 ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-green-500'}
          trend={m.churnRate > 5 ? 'down' : 'up'}
          trendValue={m.churnRate > 5 ? 'High Risk' : 'Healthy'}
          subtitle={`${m.expiringCount || 0} expiring in 7d`} delay={3} />
      </div>

      {/* ═══════════════ KPI CARDS — ROW 2 ═══════════════ */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <MiniStat icon={IndianRupee} label="Month Revenue" value={`₹${(m.monthRevenue || 0).toLocaleString('en-IN')}`} color="text-purple-400" bg="bg-purple-500/10" />
        <MiniStat icon={CreditCard} label="Active Subs" value={m.activeSubscriptions || 0} color="text-emerald-400" bg="bg-emerald-500/10" />
        <MiniStat icon={ShoppingCart} label="Total Orders" value={m.totalOrders || 0} color="text-blue-400" bg="bg-blue-500/10" />
        <MiniStat icon={Package} label="Products Listed" value={m.totalProducts || 0} color="text-cyan-400" bg="bg-cyan-500/10" />
        <MiniStat icon={MessageSquare} label="New Enquiries" value={m.pendingEnquiries || 0} color="text-amber-400" bg="bg-amber-500/10" />
        <MiniStat icon={UserPlus} label="Signups (Month)" value={m.newUsersThisMonth || 0} color="text-indigo-400" bg="bg-indigo-500/10" />
      </div>

      {/* ═══════════════ CHARTS ROW ═══════════════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-purple-400" /> Revenue Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-40 flex items-end gap-[2px] relative">
              {data?.revenueTrend?.map((d, i) => {
                const max = Math.max(...(data?.revenueTrend?.map(r => r.amount) || [1]), 1)
                const h = (d.amount / max) * 100
                return (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(h, 2)}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-purple-500/50 to-purple-400 rounded-t-sm group relative cursor-pointer hover:from-purple-500/80 hover:to-purple-300 transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-gray-600">
              <span>{data?.revenueTrend?.[0]?.date?.slice(5)}</span>
              <span>{data?.revenueTrend?.[14]?.date?.slice(5)}</span>
              <span>{data?.revenueTrend?.[29]?.date?.slice(5)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Signup Chart */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" /> User Signups (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-40 flex items-end gap-[2px] relative">
              {data?.signupTrend?.map((d, i) => {
                const max = Math.max(...(data?.signupTrend?.map(r => r.count) || [1]), 1)
                const h = (d.count / max) * 100
                return (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(h, 2)}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400 rounded-t-sm group relative cursor-pointer hover:from-emerald-500/80 hover:to-emerald-300 transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                      {d.count} signups
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-gray-600">
              <span>{data?.signupTrend?.[0]?.date?.slice(5)}</span>
              <span>{data?.signupTrend?.[14]?.date?.slice(5)}</span>
              <span>{data?.signupTrend?.[29]?.date?.slice(5)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ MAIN INSIGHTS ═══════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Distribution */}
        <Card className="border border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Plan Distribution
              <Badge variant="secondary" className="bg-white/5 text-gray-400 border-0 ml-auto text-[10px]">
                {Object.keys(data?.planDistribution || {}).length} tiers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {Object.entries(data?.planDistribution || {}).sort((a, b) => b[1] - a[1]).map(([plan, count], idx) => (
              <div key={plan} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{plan}</span>
                  <span className="text-white font-bold">{count} <span className="text-gray-600 text-[10px] font-normal">({Math.round((count / (m.totalUsers || 1)) * 100)}%)</span></span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (count / (m.totalUsers || 1)) * 100)}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={cn('h-full rounded-full', plan.includes('Free') ? 'bg-gradient-to-r from-gray-500 to-gray-400' : plan.includes('Pro') ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500')} />
                </div>
              </div>
            ))}
            {Object.keys(data?.planDistribution || {}).length === 0 && (
              <p className="py-8 text-center text-gray-500 text-sm italic">No data</p>
            )}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-500">Conversion Rate</span>
              <span className="text-emerald-400 font-bold">{Math.round((m.proUsers / (m.totalUsers || 1)) * 100)}% ({m.proUsers} paid)</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Engaged Users */}
        <Card className="lg:col-span-2 border border-white/5 bg-white/[0.02] overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Most Active Users
              <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                Ranked by Engagement Score
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Users ranked by orders, enquiries, revenue, and login activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">#</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">User</th>
                    <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Orders</th>
                    <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Enquiries</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Revenue</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Score</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500">Last Seen</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.topUsers?.slice(0, 10).map((user, idx) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3">
                        <span className={cn('text-xs font-bold', idx < 3 ? 'text-amber-400' : 'text-gray-500')}>
                          {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate max-w-[140px]">{user.full_name || 'No name'}</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{user.business_name || user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs text-blue-400 font-semibold">{user.orders_count}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs text-amber-400 font-semibold">{user.enquiries_count}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-emerald-400 font-semibold">₹{user.revenue.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge className={cn('text-[10px] border-0', user.engagement_score >= 40 ? 'bg-emerald-500/20 text-emerald-400' : user.engagement_score >= 20 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400')}>
                          {user.engagement_score}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[10px] text-gray-500">
                          {user.last_seen ? format(new Date(user.last_seen), 'dd MMM, HH:mm') : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link href={`/ekodrix-panel/customers/${user.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!data?.topUsers || data.topUsers.length === 0) && (
              <p className="py-12 text-center text-gray-500 text-sm italic">No engagement data available yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ ALERTS + RECENT ACTIVITY ═══════════════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expiring Subscription Alerts */}
        <Card className="border border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Subscription Alerts
              {(data?.expiringAlerts?.length || 0) > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-0 ml-auto text-[10px]">
                  {data?.expiringAlerts?.length} expiring soon
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {data?.expiringAlerts?.map(alert => (
                <div key={alert.user_id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', alert.days_left <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}>
                      {alert.days_left}d
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{alert.full_name}</p>
                      <p className="text-[10px] text-gray-500">{alert.plan} · {alert.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{format(new Date(alert.expires_at), 'dd MMM')}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100" asChild>
                      <Link href={`/ekodrix-panel/customers/${alert.user_id}`}><Eye className="w-3.5 h-3.5" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(!data?.expiringAlerts || data.expiringAlerts.length === 0) && (
                <div className="py-12 text-center">
                  <Shield className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All subscriptions are healthy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card className="border border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-gray-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Recent Signups
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" asChild>
              <Link href="/ekodrix-panel/customers">View All <ChevronRight className="ml-1 w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {data?.recentUsers?.slice(0, 6).map(user => (
                <Link key={user.id} href={`/ekodrix-panel/customers/${user.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group block">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarFallback className="bg-blue-500/10 text-blue-400 text-[10px]">
                        {user.full_name?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium group-hover:text-blue-400 transition-colors truncate">{user.full_name || 'No name'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                    <Clock className="w-3 h-3" />
                    {user.updated_at ? format(new Date(user.updated_at), 'dd MMM, HH:mm') : 'Recently'}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ FINANCIAL SECTION ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-pink-400" /> Financial Overview
            </h3>
            <div className="flex gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0">This Month: ₹{(m.monthRevenue || 0).toLocaleString('en-IN')}</Badge>
              <Badge className="bg-pink-500/20 text-pink-400 border-0">Lifetime: ₹{(m.totalRevenue || 0).toLocaleString('en-IN')}</Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-x divide-white/5">
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Recent Payments</p>
              <div className="space-y-3">
                {data?.recentTransactions?.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', tx.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                        <CreditCard className={cn('w-4 h-4', tx.status === 'success' ? 'text-emerald-400' : 'text-red-400')} />
                      </div>
                      <div>
                        <p className="text-xs text-white font-mono">{tx.profile?.full_name || `TXN_${tx.id.slice(0, 6)}`}</p>
                        <p className="text-[10px] text-gray-500">{format(new Date(tx.created_at), 'MMM dd, HH:mm')}</p>
                      </div>
                    </div>
                    <p className={cn('text-sm font-bold', tx.status === 'success' ? 'text-emerald-400' : 'text-red-400')}>
                      ₹{parseFloat(tx.amount as any || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Business Metrics</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Avg Revenue/User</p>
                  <p className="text-xl font-bold text-white mt-1">₹{m.totalUsers ? Math.round(m.totalRevenue / m.totalUsers).toLocaleString('en-IN') : '0'}</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Churn Risk</p>
                  <p className={cn('text-xl font-bold mt-1', m.expiringCount > 3 ? 'text-red-400' : 'text-emerald-400')}>{m.expiringCount || 0} users</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pro Conversion</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{Math.round((m.proUsers / (m.totalUsers || 1)) * 100)}%</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Prev Month</p>
                  <p className="text-xl font-bold text-gray-300 mt-1">₹{(m.prevMonthRevenue || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10" asChild>
                <Link href="/ekodrix-panel/transactions">Full Transaction History <ExternalLink className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ ACTIVE USERS MODAL ═══════════════ */}
      <Dialog open={activeUsersOpen} onOpenChange={setActiveUsersOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0d121f] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-emerald-500/20"><Activity className="w-5 h-5 text-emerald-400" /></div>
              Active Users (Last 24h)
            </DialogTitle>
          </DialogHeader>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input placeholder="Search active sessions..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <ScrollArea className="mt-4 h-[400px] pr-4">
            <div className="space-y-3">
              {data?.activeUsers?.map(user => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400">{user.full_name?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {user.full_name}
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] h-4 py-0 uppercase border-0">Active</Badge>
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white" asChild>
                    <Link href={`/ekodrix-panel/customers/${user.id}`}><ExternalLink className="w-4 h-4" /></Link>
                  </Button>
                </motion.div>
              ))}
              {(!data?.activeUsers || data.activeUsers.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                  <Activity className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No users active in the last 24 hours.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
function MiniStat({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className={cn('p-2 rounded-lg shrink-0', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-gray-500 uppercase tracking-widest truncate">{label}</p>
        <p className="text-base font-bold text-white">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      </div>
    </div>
  )
}

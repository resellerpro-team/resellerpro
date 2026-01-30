'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  CreditCard,
  IndianRupee,
  TrendingUp,
  ShoppingCart,
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface DashboardData {
  metrics: {
    totalUsers: number
    activeSubscriptions: number
    totalRevenue: number
    monthRevenue: number
    newUsersToday: number
    expiringCount: number
    totalOrders: number
    pendingEnquiries: number
    activeUsersHighlights: number
    avgUseTime: number
    freeUsers: number
    proUsers: number
  }
  recentUsers: Array<{
    id: string
    full_name: string
    email: string
    created_at?: string
    updated_at: string
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    status: string
    created_at: string
    user_id: string
  }>
  planDistribution: Record<string, number>
}

export default function EkodrixDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/ekodrix-panel/stats')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  function handleRefresh() {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    newUsersToday: 0,
    expiringCount: 0,
    totalOrders: 0,
    pendingEnquiries: 0,
    activeUsersHighlights: 0,
    avgUseTime: 0,
    freeUsers: 0,
    proUsers: 0,
  }

  const metricCards = [
    {
      title: 'Total Customers',
      value: (metrics.totalUsers || 0).toLocaleString(),
      subtitle: `${metrics.newUsersToday || 0} joined today`,
      icon: Users,
      gradient: 'from-blue-600 to-indigo-600',
      trend: 'up',
    },
    {
      title: 'Active Users (24h)',
      value: metrics.activeUsersHighlights?.toLocaleString() || '0',
      subtitle: 'Users active today',
      icon: Activity,
      gradient: 'from-cyan-500 to-blue-500',
      trend: 'up',
    },
    {
      title: 'Pro vs Free',
      value: `${metrics.proUsers || 0} / ${metrics.freeUsers || 0}`,
      subtitle: 'Subscription split',
      icon: CreditCard,
      gradient: 'from-emerald-500 to-teal-500',
      trend: 'neutral',
    },
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      subtitle: `₹${metrics.monthRevenue.toLocaleString()} this mo`,
      icon: IndianRupee,
      gradient: 'from-purple-500 to-pink-500',
      trend: 'up',
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome to Ekodrix Control Center</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, i) => (
          <Card
            key={i}
            className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">{metric.title}</p>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-2">
                    {metric.trend === 'up' && (
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    )}
                    {metric.trend === 'down' && (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs text-gray-500">{metric.subtitle}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} bg-opacity-20`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {(metric as any).alert && metrics.expiringCount > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Attention needed</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              {Object.entries(data?.planDistribution || {}).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-gray-300">{plan}</span>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-0">
                    {count} users
                  </Badge>
                </div>
              ))}
              {Object.keys(data?.planDistribution || {}).length === 0 && (
                <p className="text-gray-500 text-sm">No subscription data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {data?.recentUsers?.slice(0, 5).map((user) => (
                <div key={user.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <p className="text-sm text-white font-medium">{user.full_name || 'No name'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {user.updated_at ? format(new Date(user.updated_at), 'dd MMM, HH:mm') : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <p className="p-5 text-gray-500 text-sm">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-400" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {data?.recentTransactions?.slice(0, 5).map((tx) => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.status === 'success' ? 'bg-emerald-500/20' : 
                    tx.status === 'pending' ? 'bg-amber-500/20' : 'bg-red-500/20'
                  }`}>
                    <IndianRupee className={`w-4 h-4 ${
                      tx.status === 'success' ? 'text-emerald-400' : 
                      tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">₹{parseFloat(tx.amount?.toString() || '0').toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{tx.user_id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      tx.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    } border-0`}
                  >
                    {tx.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(tx.created_at), 'dd MMM, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
              <p className="p-5 text-gray-500 text-sm">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 justify-start"
              asChild
            >
              <a href="/ekodrix-panel/customers">
                <Users className="w-5 h-5 mr-3 text-blue-400" />
                <div className="text-left">
                  <p className="font-medium">View Customers</p>
                  <p className="text-xs text-gray-500">Manage all users</p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 justify-start"
              asChild
            >
              <a href="/ekodrix-panel/subscriptions">
                <CreditCard className="w-5 h-5 mr-3 text-emerald-400" />
                <div className="text-left">
                  <p className="font-medium">Subscriptions</p>
                  <p className="text-xs text-gray-500">Manage plans</p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 justify-start"
              asChild
            >
              <a href="/ekodrix-panel/support">
                <MessageSquare className="w-5 h-5 mr-3 text-purple-400" />
                <div className="text-left">
                  <p className="font-medium">Support Tools</p>
                  <p className="text-xs text-gray-500">Troubleshoot issues</p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 justify-start"
              asChild
            >
              <a href="/ekodrix-panel/transactions">
                <TrendingUp className="w-5 h-5 mr-3 text-amber-400" />
                <div className="text-left">
                  <p className="font-medium">Transactions</p>
                  <p className="text-xs text-gray-500">View payments</p>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

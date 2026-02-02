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
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserProfile {
  id: string
  full_name: string
  email: string
  updated_at: string
}

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
  activeUsers: UserProfile[]
  recentUsers: UserProfile[]
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
  const [activeUsersOpen, setActiveUsersOpen] = useState(false)

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
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  function handleRefresh() {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <p className="text-gray-500 animate-pulse text-sm">Synchronizing live data...</p>
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
      trend: metrics.newUsersToday > 0 ? 'up' : 'neutral',
      description: 'Total registered user base',
    },
    {
      title: 'Active Users (24h)',
      value: (data?.activeUsers?.length || 0).toLocaleString(),
      subtitle: 'Users currently engaged',
      icon: Activity,
      gradient: 'from-emerald-500 to-cyan-500',
      trend: 'up',
      clickable: true,
      onClick: () => setActiveUsersOpen(true),
      description: 'Users active in last 24 hours',
    },
    {
      title: 'Subscription Conversion',
      value: `${metrics.proUsers || 0} / ${metrics.freeUsers || 0}`,
      subtitle: `${Math.round((metrics.proUsers / (metrics.totalUsers || 1)) * 100)}% conversion`,
      icon: zapIcon(),
      gradient: 'from-amber-500 to-orange-500',
      trend: 'neutral',
      description: 'Paid vs Free split',
    },
    {
      title: 'System Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      subtitle: `+₹${metrics.monthRevenue.toLocaleString()} this month`,
      icon: IndianRupee,
      gradient: 'from-purple-500 to-pink-500',
      trend: 'up',
      description: 'Total successful processing',
    },
  ]

  function zapIcon() {
    return Zap
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
              Live updates
            </Badge>
          </div>
          <p className="text-gray-400 mt-1">Founders & Analytics Control Center V2</p>
        </div>
        <div className="flex items-center gap-3">
           <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-all duration-300 group"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              onClick={metric.onClick}
              className={`border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 
                          ${metric.clickable ? 'cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.04]' : ''} 
                          group relative shadow-2xl shadow-black/20`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.gradient} opacity-[0.03] blur-3xl`} />
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{metric.title}</p>
                      {metric.clickable && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.trend === 'up' ? (
                        <div className="p-0.5 rounded-full bg-emerald-500/20">
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </div>
                      ) : metric.trend === 'down' ? (
                        <div className="p-0.5 rounded-full bg-red-500/20">
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                        </div>
                      ) : (
                        <div className="p-0.5 rounded-full bg-blue-500/20">
                          <Activity className="w-3 h-3 text-blue-400" />
                        </div>
                      )}
                      <span className="text-xs text-gray-400 font-medium">{metric.subtitle}</span>
                    </div>
                  </div>
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${metric.gradient} bg-opacity-10 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Plan Distribution Chart */}
        <Card className="lg:col-span-1 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl">
          <CardHeader className="border-b border-white/5 pb-4 px-6 pt-6">
            <CardTitle className="text-lg text-white font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Plan Distribution
              </span>
              <Badge variant="secondary" className="bg-white/5 text-gray-400 border-0 font-normal">
                {Object.keys(data?.planDistribution || {}).length} tiers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {Object.entries(data?.planDistribution || {}).sort((a,b) => b[1] - a[1]).map(([plan, count], idx) => (
                <div key={plan} className="space-y-2 group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-medium">{plan}</span>
                    <span className="text-white font-bold">{count} <span className="text-gray-500 text-[10px] font-normal">USERS</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / (metrics.totalUsers || 1)) * 100)}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        plan === 'Free' ? 'from-blue-500 to-cyan-500' : 
                        plan.includes('Pro') ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'
                      }`} 
                    />
                  </div>
                </div>
              ))}
              {Object.keys(data?.planDistribution || {}).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
                  <Activity className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No distribution data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card className="lg:col-span-2 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl">
          <CardHeader className="border-b border-white/5 pb-4 px-6 pt-6">
            <CardTitle className="text-lg text-white font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Growth Tracking
              </span>
              <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" asChild>
                <a href="/ekodrix-panel/customers">
                  View All <ChevronRight className="ml-1 w-3 h-3" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">User Details</th>
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Email</th>
                    <th className="text-right px-6 py-4 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentUsers?.slice(0, 6).map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                              {user.full_name?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                            {user.full_name || 'Incomplete Profile'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {user.updated_at ? format(new Date(user.updated_at), 'dd MMM, HH:mm') : 'Recently'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!data?.recentUsers || data.recentUsers.length === 0) && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-sm italic">No recent signups found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Section */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-pink-400" />
              Financial Liquidity
            </h3>
            <div className="flex gap-2">
               <Badge className="bg-pink-500/20 text-pink-400 border-0">Total Success: ₹{metrics.totalRevenue.toLocaleString()}</Badge>
            </div>
          </div>
        </div>
        <div className="p-0">
          <div className="grid gap-0 md:grid-cols-2 divide-x divide-white/5">
             <div className="p-6 space-y-4">
               <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Recent Inbound Payments</p>
               <div className="space-y-3">
                 {data?.recentTransactions?.slice(0, 4).map(tx => (
                   <div key={tx.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                           <CreditCard className={`w-4 h-4 ${tx.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <p className="text-xs text-white font-bold font-mono group-hover:text-blue-400 transition-colors">TXN_{tx.id.slice(0, 6)}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{format(new Date(tx.created_at), 'MMM dd, HH:mm')}</p>
                        </div>
                     </div>
                     <p className={`text-sm font-bold ${tx.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{tx.amount.toLocaleString()}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
             <div className="p-6 bg-white/[0.01]">
                <div className="flex flex-col h-full justify-between gap-6">
                   <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Growth Metrics</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                            <p className="text-xs text-gray-500">Success Rate</p>
                            <p className="text-xl font-bold text-white">98.4%</p>
                         </div>
                         <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                            <p className="text-xs text-gray-500">Churn Risk</p>
                            <p className="text-xl font-bold text-red-400">{metrics.expiringCount}</p>
                         </div>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 transition-all duration-300" asChild>
                      <a href="/ekodrix-panel/transactions">Analyze Full Treasury <ExternalLink className="ml-2 w-4 h-4" /></a>
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </Card>

      {/* Active Users Drill-down Modal */}
      <Dialog open={activeUsersOpen} onOpenChange={setActiveUsersOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0d121f] border-white/10 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              Currently Active Users
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative mt-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input 
              placeholder="Search active sessions..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
             />
          </div>

          <ScrollArea className="mt-4 h-[400px] pr-4">
            <div className="space-y-4">
              {data?.activeUsers?.map((user) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400">
                        {user.full_name?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {user.full_name}
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] h-4 py-0 uppercase border-0">Active</Badge>
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-white/5" asChild>
                    <a href={`/ekodrix-panel/customers/${user.id}`}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </motion.div>
              ))}
              {(!data?.activeUsers || data.activeUsers.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                   <div className="p-4 rounded-full bg-white/5">
                      <Activity className="w-10 h-10 opacity-20" />
                   </div>
                   <p className="text-sm text-center">No users have been active in the last 24 hours.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

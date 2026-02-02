'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  Loader2,
  Calendar,
  Layers,
  Activity,
  Zap,
  RefreshCw,
  IndianRupee,
  Users,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AnalyticsData {
  revenueTrend: Record<string, number>
  userTrend: Record<string, number>
  planDistribution: Record<string, number>
  metrics: {
    periodRevenue: number
    periodNewUsers: number
    activeSubs: number
  }
}

// Logical business progression for the founder
const PLAN_ORDER = ['Free Plan', 'Professional', 'Business Premium', 'Business']

export default function EkodrixAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const response = await fetch('/api/ekodrix-panel/analytics')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-emerald-500 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Compiling Growth Vectors...</p>
      </div>
    )
  }

  // Calculate some derived stats
  const revenueValues = Object.values(data?.revenueTrend || {})
  const maxRevenue = Math.max(...revenueValues, 1)
  const userValues = Object.values(data?.userTrend || {})
  const maxUsers = Math.max(...userValues, 1)

  // Map and Sort plan distribution logically
  const processedPlans = Object.entries(data?.planDistribution || {}).map(([plan, count]) => {
     let name = plan
     if (plan === 'free' || plan === 'Free') name = 'Free Plan'
     if (plan === 'beginner' || plan === 'Beginner') name = 'Business Premium'
     return [name, count] as [string, number]
  }).sort((a, b) => {
    return PLAN_ORDER.indexOf(a[0]) - PLAN_ORDER.indexOf(b[0])
  })

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Executive Intelligence
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Foundational insights into market penetration and fiscal velocity</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold px-3 py-1 animate-pulse">LIVE DATA</Badge>
          <Button 
            onClick={() => fetchData(true)}
            variant="outline" 
            className="border-white/10 bg-white/5 text-gray-300 h-11 px-6 rounded-xl transition-all"
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Sync Intelligence
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
            <TrendingUp className="w-20 h-20 text-blue-500" />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Net Intake (30d)</p>
            <div className="flex items-center gap-2">
               <IndianRupee className="w-6 h-6 text-white opacity-50" />
               <span className="text-4xl font-bold text-white tracking-tighter">{(data?.metrics.periodRevenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="border border-white/5 bg-gradient-to-br from-emerald-600/10 to-transparent p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
            <Users className="w-20 h-20 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">User Onboarding (30d)</p>
            <div className="flex items-center gap-2">
               <span className="text-4xl font-bold text-white tracking-tighter">+{data?.metrics.periodNewUsers || 0}</span>
               <Badge className="bg-emerald-500/20 text-emerald-400 border-0 h-5 px-1.5 text-[9px] font-black">GROWTH</Badge>
            </div>
          </div>
        </Card>

        <Card className="border border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
            <Target className="w-20 h-20 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Active Subscriptions</p>
            <div className="flex items-center gap-2">
               <span className="text-4xl font-bold text-white tracking-tighter">{data?.metrics.activeSubs || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-2xl overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 p-6 md:p-8">
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
               <LineChart className="w-5 h-5 text-blue-500" />
               Revenue Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pb-12">
            <div className="h-[200px] md:h-[250px] flex items-end gap-1 px-2 relative border-b border-white/10 pb-4">
               {revenueValues.map((val, idx) => (
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxRevenue) * 100}%` }}
                    transition={{ delay: idx * 0.05, duration: 0.8 }}
                    key={idx} 
                    className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-400 group relative rounded-t-sm"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                       ₹{val.toLocaleString()}
                    </div>
                 </motion.div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-2xl overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 p-6 md:p-8">
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
               <Activity className="w-5 h-5 text-emerald-500" />
               User Acquisition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pb-12">
            <div className="h-[200px] md:h-[250px] flex items-end gap-1 px-2 relative border-b border-white/10 pb-4">
               {userValues.map((val, idx) => (
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxUsers) * 100}%` }}
                    transition={{ delay: idx * 0.05, duration: 0.8 }}
                    key={idx} 
                    className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400 group relative rounded-t-sm"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                       {val}
                    </div>
                 </motion.div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-2xl overflow-hidden lg:col-span-2">
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 md:p-8">
              <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                 <Layers className="w-5 h-5 text-indigo-500" />
                 Market Capture by Tier
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                 {processedPlans.map(([plan, count], idx) => {
                    const percentage = Math.round((count / (data?.metrics.activeSubs || 1)) * 100)
                    return (
                      <div key={plan} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden group">
                         <div className="flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{plan}</span>
                            <span className="text-base font-bold text-indigo-400">{percentage}%</span>
                         </div>
                         <div className="mt-2 text-3xl font-bold text-white tracking-tighter relative z-10">{count}</div>
                         <div className="mt-1 text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">Total Accounts</div>
                      </div>
                    )
                 })}
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 gap-6 border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Intelligence Sync Perfect</h3>
            <p className="text-sm text-gray-400">Audited growth metrics reflecting real platform adoption.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

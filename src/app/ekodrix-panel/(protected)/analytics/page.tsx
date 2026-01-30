'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function EkodrixAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 800)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Executive Analytics
          </h1>
          <p className="text-gray-400 mt-1">Deep insights into ResellerPro growth and platform performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold px-3 py-1">REAL-TIME</Badge>
          <Button variant="outline" className="border-white/10 bg-white/5 text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Growth Card */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-20 h-20 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue Growth</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">24.5%</span>
              <span className="text-emerald-400 text-sm font-bold flex items-center mb-1">
                <ArrowUpRight className="w-4 h-4" />
                +3.2%
              </span>
            </div>
            <p className="text-xs text-gray-400">Monthly recurring revenue trend</p>
          </div>
        </Card>

        {/* User Acquisition */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity className="w-20 h-20 text-blue-500" />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">User Velocity</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">+142</span>
              <span className="text-blue-400 text-sm font-bold flex items-center mb-1">
                <Zap className="w-4 h-4" />
                FAST
              </span>
            </div>
            <p className="text-xs text-gray-400">New signups in the current period</p>
          </div>
        </Card>

        {/* Churn Prediction */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <LineChart className="w-20 h-20 text-purple-500" />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Retention Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">92.8%</span>
              <span className="text-purple-400 text-sm font-bold flex items-center mb-1">
                HEALTHY
              </span>
            </div>
            <p className="text-xs text-gray-400">Percentage of users renewing plans</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Charts */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm h-[400px] flex flex-col items-center justify-center space-y-4 border-dashed border-white/10">
          <BarChart3 className="w-12 h-12 text-gray-600" />
          <div className="text-center">
            <p className="text-gray-400 font-bold">Revenue Timeline</p>
            <p className="text-xs text-gray-600 mt-1">Advanced data visualization pending production sync</p>
          </div>
        </Card>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm h-[400px] flex flex-col items-center justify-center space-y-4 border-dashed border-white/10">
          <PieChart className="w-12 h-12 text-gray-600" />
          <div className="text-center">
            <p className="text-gray-400 font-bold">Market Share by Plan</p>
            <p className="text-xs text-gray-600 mt-1">Cross-referencing plan performance metrics</p>
          </div>
        </Card>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI-Powered Insights Enabled</h3>
            <p className="text-sm text-gray-400">System is currently learning user behavior patterns to predict next month's growth.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

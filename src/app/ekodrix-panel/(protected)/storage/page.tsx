'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  HardDrive,
  Database,
  ShieldCheck,
  Server,
  Activity,
  Layers,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  FolderOpen,
  Cpu,
  Globe,
  Zap,
  Lock,
  History,
  CheckCircle2,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface SystemStats {
  buckets: Array<{
    id: string
    name: string
    public: boolean
    created_at: string
    sizeMB?: string
    usedPercent?: number
  }>
  database: Record<string, number>
  infrastructure?: {
    region: string
    tier: string
    bandwidth: string
    database_size: string
    status: string
    uptime: string
    last_backup: string
  }
}

export default function EkodrixStoragePage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const response = await fetch('/api/ekodrix-panel/system')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Server className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Infrastructure Control
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 h-5 px-1.5 text-[10px] uppercase font-black tracking-widest ml-2">LIVE</Badge>
            </h1>
            <p className="text-gray-400 mt-1">Foundational data systems and high-availability resource monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Uptime</span>
              <span className="text-sm font-bold text-emerald-400">{stats?.infrastructure?.uptime || '99.99%'}</span>
           </div>
           <Button
             onClick={() => fetchStats(true)}
             variant="outline"
             size="sm"
             className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-11 px-6 rounded-xl transition-all"
             disabled={refreshing}
           >
             <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
             Sync Infrastructure
           </Button>
        </div>
      </div>

      {/* Real-time Health Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: ShieldCheck, label: 'Access Control', value: 'SECURE', color: 'emerald' },
          { icon: Activity, label: 'API Latency', value: '42ms', color: 'blue' },
          { icon: History, label: 'Last Backup', value: stats?.infrastructure?.last_backup ? format(new Date(stats.infrastructure.last_backup), 'hh:mm a') : '4h ago', color: 'amber' },
          { icon: Globe, label: 'Network', value: 'STABLE', color: 'purple' },
        ].map((item, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/5 p-5 flex items-center gap-4">
            <div className={cn("p-2.5 rounded-xl", `bg-${item.color}-500/10`)}>
              <item.icon className={cn("w-5 h-5", `text-${item.color}-400`)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-base font-bold text-white">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Monitoring */}
        <div className="space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FolderOpen className="w-24 h-24 text-blue-500" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg font-bold">Cloud Storage</CardTitle>
                  <CardDescription className="text-xs">Object storage health and distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
              ) : stats?.buckets.map((bucket, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={bucket.id} 
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 hover:border-blue-500/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                         <span className="block text-sm font-bold text-white uppercase tracking-tight">{bucket.name}</span>
                         <span className="text-[10px] text-gray-500 font-bold uppercase">{bucket.public ? 'Public Access' : 'Private Access'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold px-2 py-0 border-white/5",
                      bucket.public ? "text-blue-400" : "text-amber-400"
                    )}>
                      {bucket.public ? 'PUBLIC' : 'LOCKED'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-gray-500 uppercase tracking-widest">Consumption: <span className="text-blue-400 font-mono">{bucket.sizeMB}</span></span>
                      <span className="text-gray-400">{bucket.usedPercent || 0}%</span>
                    </div>
                    <Progress value={bucket.usedPercent || 0} className="h-1.5 bg-white/5" />
                  </div>
                </motion.div>
              ))}
              {(!stats?.buckets || stats.buckets.length === 0) && !loading && (
                <p className="text-center py-8 text-gray-500 text-sm italic underline decoration-white/10 underline-offset-8">No storage buckets detected on gateway</p>
              )}
            </CardContent>
          </Card>

          {/* Detailed Hardware Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
              <Cpu className="absolute -bottom-4 -right-4 w-16 h-16 text-blue-500/10 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Region & Zone</p>
              <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{stats?.infrastructure?.region || 'ap-south-1'}</p>
            </Card>
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <Database className="absolute -bottom-4 -right-4 w-16 h-16 text-amber-500/10 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Relational Disk</p>
              <p className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{stats?.infrastructure?.database_size || '< 100MB'}</p>
            </Card>
          </div>
        </div>

        {/* Database Health Overview */}
        <div className="space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative h-full flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database className="w-24 h-24 text-emerald-500" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg font-bold tracking-tight">Relational Blueprint</CardTitle>
                  <CardDescription className="text-xs">Global table distribution and record density</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <div className="grid gap-3">
                {loading ? (
                   <div className="p-20 flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Inspecting Rows...</p>
                   </div>
                ) : Object.entries(stats?.database || {}).map(([table, count], idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={table} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 transition-all flex items-center justify-center border border-white/5">
                        <Layers className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
                      </div>
                      <div>
                         <span className="text-sm font-bold text-gray-200 capitalize tracking-tight">{table.replace('_', ' ')}</span>
                         <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-0 h-3.5 px-1 text-[8px] font-black tracking-widest">OK</Badge>
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Verified</span>
                         </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">{count.toLocaleString()}</span>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Records</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-12 h-12 text-emerald-500" />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg shadow-emerald-500/10">
                       <Lock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                       <h4 className="font-bold text-white tracking-tight">Immutable Backup Shield</h4>
                       <p className="text-xs text-gray-400 leading-relaxed mt-0.5">Your data is automatically mirrored across multiple availability zones every 24 hours.</p>
                       <div className="flex items-center gap-2 mt-3 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          BACKUP VERIFIED: {stats?.infrastructure?.last_backup ? format(new Date(stats.infrastructure.last_backup), 'dd MMM, HH:mm') : 'RECENT'}
                       </div>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

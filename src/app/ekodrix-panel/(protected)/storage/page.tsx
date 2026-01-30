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
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  }
}

export default function EkodrixStoragePage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async () => {
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

  function handleRefresh() {
    setRefreshing(true)
    fetchStats()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-8 h-8 text-emerald-500" />
            Infrastructure Control
          </h1>
          <p className="text-gray-400 mt-1">Foundational data systems and resource monitoring</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Sync Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Monitoring */}
        <div className="space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FolderOpen className="w-24 h-24 text-emerald-500" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <HardDrive className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Storage Buckets</CardTitle>
                  <CardDescription className="text-xs">Object storage health and visibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {stats?.buckets.map((bucket) => (
                <div key={bucket.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{bucket.name}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] border-white/10",
                      bucket.public ? "text-blue-400 border-blue-400/30" : "text-amber-400 border-amber-400/30"
                    )}>
                      {bucket.public ? 'Public Access' : 'Private Access'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Consumption: {bucket.sizeMB} MB</span>
                      <span className="text-gray-300">{bucket.public ? 'Public' : 'Private'} Bucket</span>
                    </div>
                    <Progress value={bucket.usedPercent || 0} className="h-1 bg-white/5" />
                  </div>
                </div>
              ))}
              {(!stats?.buckets || stats.buckets.length === 0) && (
                <p className="text-center py-8 text-gray-500 text-sm">No storage buckets found</p>
              )}
            </CardContent>
          </Card>

          {/* Quick System Status */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest text-[10px] font-bold">Server Region</p>
              <p className="text-sm font-bold text-white uppercase">{stats?.infrastructure?.region || 'ap-south-1'}</p>
            </Card>
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest text-[10px] font-bold">API Tier</p>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 h-5 px-1.5 text-[9px] font-extrabold tracking-tighter uppercase">
                {stats?.infrastructure?.tier || 'PRODUCTION'}
              </Badge>
            </Card>
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest text-[10px] font-bold">Bandwidth</p>
              <p className="text-sm font-bold text-blue-400">{stats?.infrastructure?.bandwidth || 'Unlimited'}</p>
            </Card>
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest text-[10px] font-bold">DB Disk</p>
              <p className="text-sm font-bold text-amber-500">{stats?.infrastructure?.database_size || '< 100MB'}</p>
            </Card>
          </div>
        </div>

        {/* Database Health Overview */}
        <div className="space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Database className="w-24 h-24 text-blue-500" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Database Records</CardTitle>
                  <CardDescription className="text-xs">Table sizes and data distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3">
                {Object.entries(stats?.database || {}).map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                        <Layers className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-300 capitalize">{table}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-white">{count.toLocaleString()}</span>
                      <p className="text-[10px] text-gray-600 font-medium">ENTRIES</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Automatic Backups Enabled</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-blue-400/30 text-blue-400 leading-none h-5">DAILY 2 AM</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

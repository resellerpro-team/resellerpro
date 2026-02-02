'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  UserCheck,
  UserPlus,
  ArrowRight,
  Gift,
  Search,
  RefreshCw,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Referral {
  id: string
  status: string
  created_at: string
  referrer: {
    full_name: string
    email: string
  }
  referee: {
    full_name: string
    email: string
  }
}

interface SummaryData {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
}

export default function EkodrixReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: debouncedSearch
      })
      const response = await fetch(`/api/ekodrix-panel/referrals?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setReferrals(result.data)
        setSummary(result.summary)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const successRate = summary ? Math.round((summary.completedReferrals / (summary.totalReferrals || 1)) * 100) : 0

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Viral Growth Engine
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Track user invitations and viral coefficient metrics</p>
        </div>
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Sync Growth
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
             <Zap className="w-20 h-20 text-emerald-500" />
           </div>
           <CardContent className="p-6">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Conversion Success</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-white">{successRate}%</p>
                 <p className="text-[10px] text-gray-500 font-medium">OF REVIEWS</p>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${successRate}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
           </CardContent>
        </Card>
        
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Total Invites Sent</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white">{summary?.totalReferrals || 0}</p>
                 <div className="p-2.5 bg-blue-500/10 rounded-xl">
                   <Users className="w-5 h-5 text-blue-400" />
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">UNIQUE ATTEMPTS TRACKED</p>
           </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Completed Signups</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white">{summary?.completedReferrals || 0}</p>
                 <div className="p-2.5 bg-purple-500/10 rounded-xl">
                   <CheckCircle2 className="w-5 h-5 text-purple-400" />
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">REWARDS SUCCESSFULLY DELIVERED</p>
           </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Search by Referrer or Referee (name/email)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="bg-white/5 border-white/10 h-12 pl-12 text-white rounded-xl focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Referrer (The Source)</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold text-center">Connection</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Referee (The New User)</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Lifecycle</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold text-right">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                           <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                           <p className="text-gray-500 text-sm animate-pulse">Mapping growth network...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-gray-500">No referral history found</TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((r, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={r.id} 
                        className="hover:bg-white/[0.03] border-b border-white/5 transition-colors group"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                               {r.referrer?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm tracking-tight">{r.referrer?.full_name || 'System Auto'}</p>
                              <p className="text-[11px] text-gray-500 font-medium">{r.referrer?.email || 'Ekodrix Official'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                           <div className="flex flex-col items-center gap-1">
                              <div className="w-px h-6 bg-gradient-to-b from-emerald-500/50 to-blue-500/50" />
                              <Badge className="bg-white/5 text-gray-400 text-[8px] h-4 py-0 border-white/10">LINKED</Badge>
                           </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                           <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                               {r.referee?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm tracking-tight">{r.referee?.full_name}</p>
                              <p className="text-[11px] text-gray-500 font-medium">{r.referee?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="space-y-2">
                             <Badge className={cn(
                               "border-0 px-2 py-0.5 rounded-lg text-[9px] uppercase font-bold tracking-widest shadow-none",
                               r.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                             )}>
                               {r.status}
                             </Badge>
                             <p className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                               <Calendar className="w-3 h-3" />
                               {format(new Date(r.created_at), 'dd MMM, yy')}
                             </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-9 px-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl text-xs font-bold transition-all" asChild>
                            <Link href={`/ekodrix-panel/customers/${r.referee?.email}`}>
                              Track User
                              <ArrowRight className="w-3 h-3 ml-2" />
                            </Link>
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
           {pagination.total} Networks Found
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-10 px-4 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Prev
          </Button>
          <div className="text-xs font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
             {page} / {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-10 px-4 rounded-xl transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

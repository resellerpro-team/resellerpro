'use client'

import React, { useCallback, useEffect, useState, Suspense } from 'react'
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
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, isValid } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'

interface Subscription {
  id: string
  user_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  profile?: {
    id: string
    full_name: string
    email: string
    business_name: string
  } | null
  plan: {
    display_name: string
    name: string
    price: number
  }
}

interface SummaryData {
  mrr: number
  activeCount: number
  expiringSoon: number
}

function SubscriptionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'current_period_end')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        plan: planFilter,
        sortBy,
        sortOrder,
        page: page.toString()
      })
      const response = await fetch(`/api/ekodrix-panel/subscriptions?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setSubscriptions(result.data || [])
        setSummary(result.summary || null)
        setPagination(result.pagination || { total: 0, totalPages: 1 })
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedSearch, statusFilter, planFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Revenue Monitor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-emerald-500" />
            Revenue Lifecycle
          </h1>
          <p className="text-gray-400 text-sm">Monitor Recurring Revenue and Customer Retention</p>
        </div>
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-11 px-6 rounded-xl"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Sync Records
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/20">
           <CardContent className="p-6">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Monthly Recurring Revenue</p>
              <div className="flex items-center gap-2">
                 <IndianRupee className="w-5 h-5 text-white/50" />
                 <p className="text-3xl font-bold text-white tracking-tighter">{(summary?.mrr || 0).toLocaleString()}</p>
              </div>
           </CardContent>
        </Card>
        
        <Card className="bg-white/[0.02] border-white/5">
           <CardContent className="p-6">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Active Subscribers</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white tracking-tighter">{summary?.activeCount || 0}</p>
                 <Activity className="w-5 h-5 text-emerald-400 opacity-20" />
              </div>
           </CardContent>
        </Card>

        <Card className={cn(
          "bg-white/[0.02] border-white/5",
          (summary?.expiringSoon || 0) > 0 && "bg-amber-500/10 border-amber-500/20"
        )}>
           <CardContent className="p-6">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-1.5",
                (summary?.expiringSoon || 0) > 0 ? "text-amber-400" : "text-gray-400"
              )}>Churn Risk (Expiring Soon)</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white tracking-tighter">{summary?.expiringSoon || 0}</p>
                 <AlertTriangle className={cn(
                   "w-5 h-5 opacity-20",
                   (summary?.expiringSoon || 0) > 0 ? "text-amber-400" : "text-gray-400"
                 )} />
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Tool Bar */}
      <Card className="border border-white/5 bg-white/[0.02]">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search user, email or business identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-200 pl-10 h-12 rounded-xl"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-white/10 bg-white/5 text-gray-300 h-12 w-full md:w-[150px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white rounded-xl">
                <SelectItem value="all">Every State</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Plans</SelectItem>
                <SelectItem value="canceled">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="border-white/10 bg-white/5 text-gray-300 h-12 w-full md:w-[180px] rounded-xl">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white rounded-xl">
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Business Premium">Business Premium</SelectItem>
                <SelectItem value="Free">Free Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-black">Customer</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-black text-center">Subscription</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-black">Status</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-black">Valid Until</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-black text-right">Action</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                       <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                       <p className="text-[10px] text-gray-500 font-black uppercase mt-4 tracking-widest">Validating Revenue Cache...</p>
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-gray-500 italic">No matching records found in the ledger.</TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => {
                    const isExpired = sub.current_period_end ? new Date(sub.current_period_end) < new Date() : false
                    const daysLeft = sub.current_period_end ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
                    
                    return (
                      <TableRow key={sub.id} className="hover:bg-white/[0.03] border-b border-white/5">
                        <TableCell className="py-4 px-6 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                              {sub.profile?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm truncate">{sub.profile?.full_name || 'Anonymous User'}</p>
                              <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-tighter truncate">{sub.profile?.business_name || 'Ekodrix Partner'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                           <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                             {sub.plan.display_name}
                           </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-[9px] font-black uppercase tracking-widest">
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", sub.status === 'active' && !isExpired ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
                              <span className={sub.status === 'active' && !isExpired ? "text-emerald-400" : "text-red-400"}>
                                {isExpired ? 'Lapsed' : sub.status}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 whitespace-nowrap text-[10px] text-gray-400 font-bold">
                           {sub.current_period_end && isValid(new Date(sub.current_period_end)) ? format(new Date(sub.current_period_end), 'dd MMM yyyy') : '--'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-9 px-3 text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-[10px] font-black uppercase" asChild>
                            <Link href={`/ekodrix-panel/customers/${sub.user_id}`}>
                               Details
                               <ArrowRight className="w-3 h-3 ml-2" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          Active Registry: <span className="text-white">{pagination.total} ENTITIES</span>
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-10 px-4 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-emerald-400">
             {page} / {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-10 px-4 rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EkodrixSubscriptionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
      <SubscriptionsContent />
    </Suspense>
  )
}

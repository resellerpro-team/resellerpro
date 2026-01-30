'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowUpRight,
  ArrowDownRight,
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
import { Suspense } from 'react'

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

export default function EkodrixSubscriptionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>}>
      <SubscriptionsContent />
    </Suspense>
  )
}

function SubscriptionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'current_period_end')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async () => {
    setLoading(true)
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
        setSubscriptions(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, planFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchData()
    // Sync URL without reload
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (planFilter !== 'all') params.set('plan', planFilter)
    if (sortBy !== 'current_period_end') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (page !== 1) params.set('page', page.toString())

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [fetchData, debouncedSearch, statusFilter, planFilter, sortBy, sortOrder, page])

  // React to URL parameter changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchTerm && !debouncedSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-emerald-500" />
            Subscriptions Overview
            <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {pagination.total} Active
            </Badge>
          </h1>
          <p className="text-gray-400 mt-1">Monitor all active and expired plans across the platform</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search user, email or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-200 pl-10 h-11 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-white/10 bg-white/5 text-gray-300 h-11 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="border-white/10 bg-white/5 text-gray-300 h-11 w-[140px]">
                <SelectValue placeholder="Plan Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="ekodrix_pro">Pro</SelectItem>
                <SelectItem value="ekodrix_basic">Basic</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5">
                <TableRow>
                  <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">User & Business</TableHead>
                  <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold text-center">Plan</TableHead>
                  <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">
                    <button
                      onClick={() => { setSortBy('status'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Status
                      {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">
                    <button
                      onClick={() => { setSortBy('current_period_end'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Validity
                      {sortBy === 'current_period_end' && (sortOrder === 'asc' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-gray-500">No subscriptions found</TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const isExpired = new Date(sub.current_period_end) < new Date()
                  return (
                    <TableRow key={sub.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                            {sub.profile?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{sub.profile?.full_name || 'System User'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{sub.profile?.business_name || 'Individual'}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{sub.profile?.email || 'no-email@resellerpro.in'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
                          {sub.plan.display_name}
                        </Badge>
                        <p className="text-[10px] text-gray-600 mt-1">₹{sub.plan.price}/month</p>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            sub.status === 'active' && !isExpired ? "bg-emerald-500" : "bg-red-500"
                          )} />
                          <span className={cn(
                            "text-xs font-medium uppercase tracking-widest",
                            sub.status === 'active' && !isExpired ? "text-emerald-400" : "text-red-400"
                          )}>
                            {isExpired ? 'Expired' : sub.status}
                          </span>
                        </div>
                        {sub.cancel_at_period_end && (
                          <p className="text-[10px] text-amber-500/70 mt-1 italic italic">Cancels at end</p>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3 text-emerald-500/60" />
                            {sub.current_period_start && isValid(new Date(sub.current_period_start)) 
                              ? format(new Date(sub.current_period_start), 'dd MMM yy') 
                              : 'N/A'} — 
                            {sub.current_period_end && isValid(new Date(sub.current_period_end))
                              ? format(new Date(sub.current_period_end), 'dd MMM yy')
                              : 'N/A'}
                          </div>
                          {isExpired ? (
                            <p className="text-[10px] text-red-400/60 font-medium">
                              Expired {sub.current_period_end && isValid(new Date(sub.current_period_end)) ? format(new Date(sub.current_period_end), 'dd MMM') : ''}
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-400/60 font-medium">
                              Ends in {sub.current_period_end ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : '?'} days
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg text-xs" asChild>
                          <Link href={`/ekodrix-panel/customers/${sub.user_id}`}>
                            View Profile
                            <ArrowRight className="w-3 h-3 ml-1.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{pagination.totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white rounded-lg h-9"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white rounded-lg h-9"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

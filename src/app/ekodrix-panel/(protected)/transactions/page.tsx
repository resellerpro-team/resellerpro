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
  Receipt,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Search,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  razorpay_order_id: string
  razorpay_payment_id: string
  profile: {
    full_name: string
    email: string
  }
}

interface SummaryData {
  totalVolume: number
  successRevenue: number
  successCount: number
}

export default function EkodrixTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
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
      const response = await fetch(`/api/ekodrix-panel/transactions?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setTransactions(result.data)
        setSummary(result.summary)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-8 h-8 text-amber-500" />
            Payment Treasury
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Audit all incoming revenue and payment gateway attempts</p>
        </div>
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white transition-all"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Refresh Treasury
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/20 backdrop-blur-md">
           <CardContent className="p-6">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Total Net Revenue</p>
              <div className="flex items-center gap-2">
                 <IndianRupee className="w-6 h-6 text-white" />
                 <p className="text-3xl font-bold text-white">{(summary?.successRevenue || 0).toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-amber-400/60 mt-2 font-medium">SUCCESSFUL TRANSACTIONS ONLY</p>
           </CardContent>
        </Card>
        
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Success Volume</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white">{summary?.successCount || 0}</p>
                 <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                   <Target className="w-5 h-5 text-emerald-400" />
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">PAID PLAN CONVERSIONS</p>
           </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Processing Rate</p>
              <div className="flex items-center justify-between">
                 <p className="text-3xl font-bold text-white">{Math.round(((summary?.successCount || 0) / (summary?.totalVolume || 1)) * 100)}%</p>
                 <div className="p-2.5 bg-blue-500/10 rounded-xl">
                   <TrendingUp className="w-5 h-5 text-blue-400" />
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">ATTEMPT TO SUCCESS RATIO</p>
           </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
          <Input
            placeholder="Search by Order ID, Payment ID, or Customer Email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="bg-white/5 border-white/10 h-12 pl-12 text-white rounded-xl focus:border-amber-500 transition-all font-medium"
          />
        </div>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">User Identity</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold text-center">Amount</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Verification Status</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Gateway References</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                           <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                           <p className="text-gray-500 text-sm animate-pulse tracking-widest uppercase text-[10px]">Verifying ledger with gateway...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-gray-500">No transactions recorded</TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        key={tx.id} 
                        className="hover:bg-white/[0.03] border-b border-white/5 transition-colors group"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:border-amber-500/30 transition-all">
                              <User className="w-4 h-4 group-hover:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{tx.profile?.full_name || 'System User'}</p>
                              <p className="text-[11px] text-gray-600 truncate max-w-[150px] group-hover:text-gray-400 transition-colors">{tx.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <div className="inline-flex flex-col items-center">
                             <div className="flex items-center gap-1 font-bold text-white text-base">
                               <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                               {tx.amount?.toLocaleString()}
                             </div>
                             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{tx.currency}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                           <div className="flex flex-col gap-1.5">
                             <Badge className={cn(
                               "border-0 shadow-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit",
                               tx.status === 'success' ? "bg-emerald-500/20 text-emerald-400" :
                               tx.status === 'pending' ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                             )}>
                               {tx.status === 'success' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                               {tx.status}
                             </Badge>
                             {tx.status === 'success' && (
                               <div className="flex items-center gap-1 text-[9px] text-emerald-500/60 font-bold uppercase">
                                 <CreditCard className="w-3 h-3" />
                                 SECURE CHANNEL
                               </div>
                             )}
                           </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                           <div className="space-y-1 font-mono text-[10px]">
                              <div className="flex items-center gap-2 group/id">
                                 <span className="text-gray-600 uppercase font-bold text-[8px]">ORD:</span>
                                 <span className="text-gray-400 group-hover/id:text-blue-400 transition-colors">{tx.razorpay_order_id || 'N/A'}</span>
                              </div>
                              {tx.razorpay_payment_id && (
                                <div className="flex items-center gap-2 group/id">
                                   <span className="text-gray-600 uppercase font-bold text-[8px]">PAY:</span>
                                   <span className="text-emerald-500/60 group-hover/id:text-emerald-400 transition-colors">{tx.razorpay_payment_id}</span>
                                </div>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                           <div className="inline-flex flex-col items-end">
                              <p className="text-xs text-white font-bold">{format(new Date(tx.created_at), 'dd MMM yyyy')}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Clock className="w-3 h-3" />
                                {format(new Date(tx.created_at), 'hh:mm a')}
                              </div>
                           </div>
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
      <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">
           Ledger: <span className="text-white italic">{pagination.total} ENTRIES</span>
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
            Previous
          </Button>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-amber-500">
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

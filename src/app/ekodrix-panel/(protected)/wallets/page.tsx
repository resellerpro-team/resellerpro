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
  Wallet,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  User,
  ArrowRight,
  Search,
  RefreshCw,
  Info,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WalletUser {
  id: string
  full_name: string
  email: string
  wallet_balance: number
  business_name: string
}

interface SummaryData {
  totalLiquidity: number
  activeWallets: number
}

export default function EkodrixWalletsPage() {
  const [wallets, setWallets] = useState<WalletUser[]>([])
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
      const response = await fetch(`/api/ekodrix-panel/wallets?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setWallets(result.data)
        setSummary(result.summary)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
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
            <Wallet className="w-8 h-8 text-emerald-500" />
            Wallet Intelligence
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Monitor platform liquidity and user fund distribution</p>
        </div>
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Sync Balances
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/20 backdrop-blur-md">
           <CardContent className="p-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Platform Liquidity</p>
                    <div className="flex items-center gap-2">
                       <IndianRupee className="w-6 h-6 text-white" />
                       <p className="text-3xl font-bold text-white">{(summary?.totalLiquidity || 0).toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="p-3 bg-emerald-500/20 rounded-xl">
                   <TrendingUp className="w-6 h-6 text-emerald-400" />
                 </div>
              </div>
           </CardContent>
        </Card>
        
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Funded Wallets</p>
                    <p className="text-3xl font-bold text-white">{summary?.activeWallets || 0}</p>
                 </div>
                 <div className="p-3 bg-blue-500/20 rounded-xl">
                   <ShieldCheck className="w-6 h-6 text-blue-400" />
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
           <CardContent className="p-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Avg. Balance/User</p>
                    <p className="text-3xl font-bold text-white">
                      ₹{Math.round((summary?.totalLiquidity || 0) / (summary?.activeWallets || 1)).toLocaleString()}
                    </p>
                 </div>
                 <div className="p-3 bg-purple-500/20 rounded-xl">
                   <Info className="w-6 h-6 text-purple-400" />
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Search & Bulk Actions */}
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search user name, email, or business..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="bg-white/5 border-white/10 h-12 pl-12 text-white rounded-xl focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">User & Identity</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Business Entity</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold">Current Balance</TableHead>
                    <TableHead className="text-gray-400 py-5 px-6 text-[10px] uppercase tracking-widest font-bold text-right">Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                           <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                           <p className="text-gray-500 text-sm animate-pulse whitespace-nowrap">Analyzing platform finances...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : wallets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-gray-500 italic">
                         No wallets found matching "{searchTerm}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    wallets.map((w, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={w.id} 
                        className="hover:bg-white/[0.03] border-b border-white/5 transition-colors group"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
                              {w.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">{w.full_name}</p>
                              <p className="text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors">{w.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-xs text-gray-400 font-medium">{w.business_name || 'Individual'}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className={cn(
                            "flex items-center gap-1.5 font-bold text-lg",
                            w.wallet_balance > 0 ? "text-emerald-400" : "text-gray-600"
                          )}>
                            <IndianRupee className="w-4 h-4" />
                            {w.wallet_balance.toLocaleString()}
                            {w.wallet_balance > 500 && (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500 animate-bounce" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-9 px-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl text-xs font-bold transition-all" asChild>
                            <Link href={`/ekodrix-panel/customers/${w.id}`}>
                              Audit History
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
      <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500 font-medium">
           Displaying <span className="text-white">{wallets.length}</span> of <span className="text-white">{pagination.total}</span> accounts
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
          <div className="flex items-center gap-1 text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-emerald-400">
            {page} <span className="text-gray-600 font-normal">/</span> {pagination.totalPages}
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

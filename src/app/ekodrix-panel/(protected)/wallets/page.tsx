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
  Wallet,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  User,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface WalletUser {
  id: string
  full_name: string
  email: string
  wallet_balance: number
  business_name: string
}

export default function EkodrixWalletsPage() {
  const [wallets, setWallets] = useState<WalletUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ekodrix-panel/wallets?page=${page}`)
      const result = await response.json()
      if (result.success) {
        setWallets(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-8 h-8 text-emerald-500" />
            Wallet Monitoring
          </h1>
          <p className="text-gray-400 mt-1">Real-time balances for all platform users</p>
        </div>
      </div>

      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5">
              <TableRow>
                <TableHead className="text-gray-300 py-4 px-6">User</TableHead>
                <TableHead className="text-gray-300 py-4 px-6">Business</TableHead>
                <TableHead className="text-gray-300 py-4 px-6">Balance</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : wallets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-gray-500">No active wallets found</TableCell>
                </TableRow>
              ) : (
                wallets.map((w) => (
                  <TableRow key={w.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/10">
                          {w.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{w.full_name}</p>
                          <p className="text-[11px] text-gray-600">{w.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="text-sm text-gray-400">{w.business_name || '—'}</span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <IndianRupee className="w-4 h-4" />
                        {w.wallet_balance.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white" asChild>
                        <Link href={`/ekodrix-panel/customers/${w.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-9 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="border-white/10 bg-white/5 text-gray-400 hover:text-white h-9 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

export default function EkodrixTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ekodrix-panel/transactions?page=${page}`)
      const result = await response.json()
      if (result.success) {
        setTransactions(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
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
            <Receipt className="w-8 h-8 text-amber-500" />
            Payment Transactions
          </h1>
          <p className="text-gray-400 mt-1">Platform-wide financial history and revenue tracking</p>
        </div>
      </div>

      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5">
              <TableRow>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">User</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">Amount</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">Status</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">Payment Details</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-gray-500">No transactions recorded</TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{tx.profile?.full_name || 'System User'}</p>
                          <p className="text-[11px] text-gray-600 truncate max-w-[150px]">{tx.profile?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-1 font-bold text-white">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                        {tx.amount?.toLocaleString()}
                      </div>
                      <p className="text-[9px] text-gray-600 font-medium uppercase tracking-tighter">{tx.currency}</p>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className={cn(
                        "border-0 shadow-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        tx.status === 'success' ? "bg-emerald-500/20 text-emerald-400" :
                        tx.status === 'pending' ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-mono">Order: {tx.razorpay_order_id || 'N/A'}</p>
                        {tx.razorpay_payment_id && (
                          <p className="text-[10px] text-emerald-500/60 font-mono">Payment: {tx.razorpay_payment_id}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <p className="text-xs text-gray-400 font-medium">{format(new Date(tx.created_at), 'dd MMM yyyy')}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <Clock className="w-3 h-3" />
                        {format(new Date(tx.created_at), 'hh:mm a')}
                      </div>
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

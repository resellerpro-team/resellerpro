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
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  UserCheck,
  UserPlus,
  ArrowRight,
  Gift,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

export default function EkodrixReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ekodrix-panel/referrals?page=${page}`)
      const result = await response.json()
      if (result.success) {
        setReferrals(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
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
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Referral Tracking
          </h1>
          <p className="text-gray-400 mt-1">Monitor growth and referral success rates across the platform</p>
        </div>
      </div>

      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5">
              <TableRow>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider">Referrer (Source)</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider">Referee (New User)</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-gray-300 py-4 px-6 text-xs uppercase tracking-wider">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-gray-500">No referral history found</TableCell>
                </TableRow>
              ) : (
                referrals.map((r) => (
                  <TableRow key={r.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{r.referrer?.full_name || 'System'}</p>
                          <p className="text-[11px] text-gray-600">{r.referrer?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{r.referee?.full_name}</p>
                          <p className="text-[11px] text-gray-600">{r.referee?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className={cn(
                        "border-0 px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider shadow-none",
                        r.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {r.status}
                      </Badge>
                      {r.status === 'completed' && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-500/60 font-medium">
                          <Gift className="w-3 h-3" />
                          REWARD CREDITED
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-400 font-medium">{format(new Date(r.created_at), 'dd MMM yyyy')}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-tighter">{format(new Date(r.created_at), 'hh:mm a')}</p>
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

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  LifeBuoy,
  Search,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  RefreshCw,
  SearchIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Enquiry {
  id: string
  customer_name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
  reseller?: {
    full_name: string
    business_name: string
    email: string
  }
}

interface SummaryData {
  total: number
  pending: number
  converted: number
}

export default function EkodrixSupportPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const response = await fetch('/api/ekodrix-panel/support')
      const result = await response.json()
      if (result.success) {
        setEnquiries(result.data)
        setSummary(result.summary)
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/ekodrix-panel/customers?search=${search}`)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <LifeBuoy className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Lead & Support Center</h1>
            <p className="text-gray-400 mt-1">Cross-platform inquiry monitoring and user troubleshooting</p>
          </div>
        </div>
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-gray-400 hover:text-white"
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Sync Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-white">Direct User Lookup</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Instantly find a user to check their status, payments, or plan validity.</p>
                </div>
                <div className="relative group">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder="Email or Phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 pl-12 text-white rounded-xl focus:border-emerald-500 transition-all"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                  Search & Resolve
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-white/[0.02] p-6">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Platform Stats</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                   <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-300">Total Leads</span>
                   </div>
                   <span className="font-bold text-white font-mono">{summary?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                   <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-300">Pending Follow-up</span>
                   </div>
                   <span className="font-bold text-white font-mono">{summary?.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-gray-300">Converted</span>
                   </div>
                   <span className="font-bold text-white font-mono">{summary?.converted || 0}</span>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column: Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-white text-lg">Inbound Lead Stream</CardTitle>
                   <CardDescription className="text-xs">Real-time enquiries being received by your users.</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 font-bold px-3">LIVE FEED</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-500 space-y-4">
                   <MessageSquare className="w-12 h-12 opacity-20" />
                   <p className="italic">No enquiries found in the stream.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                   {enquiries.map((e, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={e.id} 
                        className="p-6 hover:bg-white/[0.02] transition-all group"
                      >
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                               <User className="w-5 h-5 text-emerald-500" />
                             </div>
                             <div className="space-y-1">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                  {e.customer_name}
                                  <Badge className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest border-0 h-4 px-1.5",
                                    e.status === 'new' ? "bg-blue-500/20 text-blue-400" :
                                    e.status === 'contacted' ? "bg-amber-500/20 text-amber-400" :
                                    "bg-emerald-500/20 text-emerald-400"
                                  )}>
                                    {e.status}
                                  </Badge>
                                </h4>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                   <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {e.email || 'No Email'}
                                   </div>
                                   <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {e.phone}
                                   </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic line-clamp-2 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                                  "{e.message}"
                                </p>
                             </div>
                          </div>
                          <div className="text-right space-y-2">
                             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{format(new Date(e.created_at), 'dd MMM yyyy')}</p>
                             <div className="flex flex-col items-end">
                                <p className="text-[9px] text-gray-600 font-bold uppercase">VIA RESELLER</p>
                                <p className="text-[11px] text-emerald-500 font-bold">{e.reseller?.business_name || e.reseller?.full_name || 'System'}</p>
                             </div>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

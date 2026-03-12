'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Search, Users, Eye, ChevronLeft, ChevronRight, Loader2,
  Calendar, CreditCard, Briefcase, MessageSquare, Send,
  ArrowUpRight, ArrowDownRight, Phone, Mail, Download,
  UserCheck, UserX, TrendingUp, Activity,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { exportToCSV } from '@/lib/utils/export'
import { motion } from 'framer-motion'
import { StatusBadge } from '@/components/admin/status-badge'

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  business_name: string
  created_at?: string
  updated_at?: string
  subscription?: {
    status: string
    current_period_end: string
    plan?: {
      display_name: string
      name: string
    }
  }
}

export default function EkodrixCustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>}>
      <CustomersContent />
    </Suspense>
  )
}

function CustomersContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'updated_at')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 })

  // Messaging state
  const [msgOpen, setMsgOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgPriority, setMsgPriority] = useState('normal')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: page.toString()
      })
      const response = await fetch(`/api/ekodrix-panel/customers?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setCustomers(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchCustomers()
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (sortBy !== 'updated_at') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (page !== 1) params.set('page', page.toString())
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [fetchCustomers, debouncedSearch, statusFilter, sortBy, sortOrder, page])

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchTerm && !debouncedSearch) setSearchTerm(urlSearch)
  }, [searchParams])

  async function handleSendMessage() {
    if (!selectedUser || !msgTitle || !msgBody) {
      toast({ title: 'Error', description: 'Please enter title and message', variant: 'destructive' })
      return
    }
    setSendingMsg(true)
    try {
      const response = await fetch('/api/ekodrix-panel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, title: msgTitle, message: msgBody, priority: msgPriority }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Sent', description: `Message delivered to ${selectedUser.full_name}` })
        setMsgOpen(false); setMsgTitle(''); setMsgBody(''); setSelectedUser(null)
      } else { throw new Error(result.error) }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' })
    } finally { setSendingMsg(false) }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ search: debouncedSearch, status: statusFilter, sortBy, sortOrder, export: 'true' })
      const response = await fetch(`/api/ekodrix-panel/customers?${params.toString()}`)
      const result = await response.json()
      if (!result.success || !result.data || result.data.length === 0) {
        toast({ title: 'No data', description: 'No customers found for export', variant: 'destructive' })
        return
      }
      const exportData = result.data.map((c: any) => ({
        'Full Name': c.full_name || 'N/A',
        'Email': c.email || 'N/A',
        'Phone': c.phone || 'N/A',
        'Business': c.business_name || 'N/A',
        'Status': c.subscription?.status || 'Free',
        'Plan': c.subscription?.plan?.display_name || 'Free',
        'Joined': (c.created_at || c.updated_at) ? format(new Date(c.created_at || c.updated_at || ''), 'dd MMM yyyy') : 'N/A'
      }))
      exportToCSV(exportData, 'ekodrix_customers', {
        company: 'Ekodrix',
        reportType: 'Full Customer List',
        generatedOn: format(new Date(), 'dd MMM yyyy HH:mm'),
        totalRecords: result.pagination.total
      })
      toast({ title: 'Success', description: `CSV Export of ${result.data.length} customers finished` })
    } catch (error) {
      console.error('Export failed:', error)
      toast({ title: 'Error', description: 'Failed to generate report', variant: 'destructive' })
    } finally { setExporting(false) }
  }

  // Quick Stats
  const totalCustomers = pagination.total
  const activeCount = customers.filter(c => c.subscription?.status === 'active').length
  const freeCount = customers.filter(c => !c.subscription || c.subscription.plan?.name === 'free').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-emerald-500" />
            Customer Management
            {totalCustomers > 0 && (
              <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {totalCustomers} Total
              </Badge>
            )}
          </h1>
          <p className="text-gray-400 mt-1">Manage and monitor all ResellerPro users</p>
        </div>
      </div>

      {/* ═══════════════ QUICK STATS BAR ═══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickStat icon={Users} label="Total Customers" value={totalCustomers} color="text-blue-400" bg="bg-blue-500/10" />
        <QuickStat icon={UserCheck} label="Active Subs (Page)" value={activeCount} color="text-emerald-400" bg="bg-emerald-500/10" />
        <QuickStat icon={UserX} label="Free Users (Page)" value={freeCount} color="text-amber-400" bg="bg-amber-500/10" />
        <QuickStat icon={Activity} label="Current Page" value={`${customers.length} shown`} color="text-purple-400" bg="bg-purple-500/10" />
      </div>

      {/* ═══════════════ FILTERS & SEARCH ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, phone, or business..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-200 pl-10 h-11 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={val => { setStatusFilter(val); setPage(1) }}>
              <SelectTrigger className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 h-11 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Subs</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pro">Pro Users</SelectItem>
                <SelectItem value="free">Free Users</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 h-11 px-5"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ CUSTOMERS TABLE ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.03] border-b border-white/5">
                <TableRow>
                  <TableHead className="text-gray-300 py-4 px-5">
                    <button onClick={() => { setSortBy('full_name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-white transition-colors">
                      Customer
                      {sortBy === 'full_name' && (sortOrder === 'asc' ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-400 py-4 px-5">Contact</TableHead>
                  <TableHead className="text-gray-400 py-4 px-5">Subscription</TableHead>
                  <TableHead className="text-gray-300 py-4 px-5">
                    <button onClick={() => { setSortBy('updated_at'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-white transition-colors">
                      Joined
                      {sortBy === 'updated_at' && (sortOrder === 'asc' ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-300 py-4 px-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                      <p className="text-gray-500 mt-2">Loading customers...</p>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                      No customers found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map(customer => (
                    <TableRow key={customer.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
                      {/* Customer & Business */}
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                            {customer.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{customer.full_name || 'No name'}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                              <Briefcase className="w-3 h-3 text-emerald-500/60 shrink-0" />
                              <span className="truncate">{customer.business_name || 'Business not setup'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact: Email + Phone */}
                      <TableCell className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Mail className="w-3 h-3 text-blue-400/60 shrink-0" />
                            <span className="truncate max-w-[180px]">{customer.email || '—'}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Phone className="w-3 h-3 text-emerald-400/60 shrink-0" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Subscription */}
                      <TableCell className="py-4 px-5">
                        {customer.subscription ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={customer.subscription.status} size="sm" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <CreditCard className="w-3 h-3 text-emerald-500/60" />
                              {customer.subscription.plan?.display_name || 'Free'}
                            </div>
                            {customer.subscription.current_period_end && (
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Calendar className="w-3 h-3 text-emerald-500/60" />
                                Ends: {format(new Date(customer.subscription.current_period_end), 'dd MMM yyyy')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="secondary" className="bg-white/5 text-gray-400 border-0 text-[10px]">Free Plan</Badge>
                            <p className="text-[10px] text-gray-600 italic">No active sub</p>
                          </div>
                        )}
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="py-4 px-5">
                        <p className="text-sm text-gray-400">
                          {(customer.created_at || customer.updated_at) ? format(new Date(customer.created_at || customer.updated_at || ''), 'dd MMM yyyy') : 'N/A'}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {(customer.created_at || customer.updated_at) ? format(new Date(customer.created_at || customer.updated_at || ''), 'hh:mm a') : ''}
                        </p>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => { setSelectedUser(customer); setMsgOpen(true) }}
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" asChild>
                            <Link href={`/ekodrix-panel/customers/${customer.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ PAGINATION ═══════════════ */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Showing <span className="text-white font-medium">{customers.length}</span> of <span className="text-white font-medium">{pagination.total}</span> customers
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="border-white/10 bg-white/5 text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-md border border-white/10 text-sm text-white">
            Page {page} of {pagination.totalPages}
          </div>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="border-white/10 bg-white/5 text-gray-400 hover:text-white">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* ═══════════════ MESSAGING DIALOG ═══════════════ */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedUser?.full_name}</DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">Direct notification to user's dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-gray-400">Message Title</Label>
              <Input id="title" placeholder="e.g., Important Account Update" value={msgTitle} onChange={e => setMsgTitle(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs text-gray-400">Priority</Label>
              <Select value={msgPriority} onValueChange={setMsgPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High (Red Alert)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs text-gray-400">Message Body</Label>
              <Textarea id="message" placeholder="Write your message here..." value={msgBody} onChange={e => setMsgBody(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMsgOpen(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={handleSendMessage} disabled={sendingMsg} className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// QUICK STAT MINI COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

function QuickStat({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className={cn('p-2 rounded-lg shrink-0', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

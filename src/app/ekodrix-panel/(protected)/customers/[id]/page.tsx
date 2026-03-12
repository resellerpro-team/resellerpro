'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  User, Mail, Phone, Calendar, CreditCard, Briefcase, ExternalLink,
  ShieldCheck, ShieldAlert, Loader2, ChevronLeft, IndianRupee, Clock,
  History, Unlock, AlertCircle, MessageSquare, Send, Globe, MapPin,
  ShoppingCart, Package, Star, Wallet, FileText, Copy, ArrowRight,
  Activity, TrendingUp, Hash, Users, Zap,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

import { KpiCard } from '@/components/admin/kpi-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { ActivityTimeline, type TimelineEvent } from '@/components/admin/activity-timeline'

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

interface CustomerDetail {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string | null
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  business_website: string
  gstin: string
  pan_number: string
  wallet_balance: number
  referral_code: string
  role: string
  updated_at: string
  auth_created_at: string | null
  last_sign_in: string | null
  subscription: {
    id: string
    status: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    plan: {
      id: string
      name: string
      display_name: string
      price: number
      billing_period: string
      features: any
    } | null
  } | null
  metrics: {
    ltv: number
    aov: number
    orders_count: number
    enquiries_count: number
    products_count: number
    days_as_customer: number
    sub_days_remaining: number
  }
  recentOrders: any[]
  recentTransactions: any[]
  recentEnquiries: any[]
  walletTransactions: any[]
  usageData: any[]
  timeline: TimelineEvent[]
  referrals: any[]
  referredBy: any | null
}

// ──────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function EkodrixCustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Messaging state
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgPriority, setMsgPriority] = useState('normal')
  const [sendingMsg, setSendingMsg] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [custRes, plansRes] = await Promise.all([
        fetch(`/api/ekodrix-panel/customers/${id}`),
        fetch('/api/ekodrix-panel/plans'),
      ])
      const custResult = await custRes.json()
      const plansResult = await plansRes.json()
      if (custResult.success) setData(custResult.data)
      if (plansResult.success) setPlans(plansResult.data)
    } catch (error) {
      console.error('Failed to fetch customer detail:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSubscriptionAction(action: 'unlock' | 'extend', planId: string) {
    if (!confirm(`Are you sure you want to ${action} this subscription?`)) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/ekodrix-panel/customers/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, planId, durationDays: 30 }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Success', description: result.message })
        fetchData()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!msgTitle || !msgBody) {
      toast({ title: 'Error', description: 'Please enter title and message', variant: 'destructive' })
      return
    }
    setSendingMsg(true)
    try {
      const response = await fetch('/api/ekodrix-panel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, title: msgTitle, message: msgBody, priority: msgPriority }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Sent', description: 'Message delivered to user notification center' })
        setMsgOpen(false); setMsgTitle(''); setMsgBody('')
      } else { throw new Error(result.error) }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' })
    } finally { setSendingMsg(false) }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: `${label} copied to clipboard` })
  }

  // ─── LOADING STATE ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <p className="text-sm text-gray-500 animate-pulse">Loading customer intelligence...</p>
      </div>
    )
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Customer not found</div>

  const isSubscribed = data.subscription?.status === 'active'
  const joinedDate = data.auth_created_at || data.updated_at

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* ═══════════════ BACK BUTTON ═══════════════ */}
      <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Customers
      </Button>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <Card className="border border-white/5 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-transparent backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 blur-3xl" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              {data.avatar_url ? (
                <img src={data.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                data.full_name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{data.full_name || 'No Name'}</h1>
                <StatusBadge status={isSubscribed ? 'active' : 'inactive'} size="md" />
                {data.subscription?.plan && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {data.subscription.plan.display_name}
                  </Badge>
                )}
              </div>

              {/* Contact line */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-400">
                <button onClick={() => copyToClipboard(data.email, 'Email')} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
                  <Mail className="w-4 h-4 text-emerald-500/60" />
                  <span className="truncate max-w-[200px]">{data.email}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {data.phone && (
                  <button onClick={() => copyToClipboard(data.phone, 'Phone')} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
                    <Phone className="w-4 h-4 text-emerald-500/60" />
                    <span>{data.phone}</span>
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500/60" />
                  Member since {joinedDate ? format(new Date(joinedDate), 'dd MMM yyyy') : 'Recently'}
                </div>
                {data.last_sign_in && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500/60" />
                    Last seen {format(new Date(data.last_sign_in), 'dd MMM, HH:mm')}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Wallet Balance</p>
                <p className="text-2xl font-bold text-white">₹{data.wallet_balance?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 h-9"
                  onClick={() => data.email && window.open(`mailto:${data.email}`)}
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                </Button>
                {data.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 h-9"
                    onClick={() => window.open(`https://wa.me/91${data.phone.replace(/\D/g, '').slice(-10)}`)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setMsgOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-9"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Notify
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ CONTACT INFORMATION CARD ═══════════════ */}
      <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-base text-gray-200 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Account */}
            <div className="space-y-3">
              <p className="text-[10px] text-emerald-400 uppercase tracking-[0.15em] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Primary Account
              </p>
              <InfoRow icon={Mail} label="Account Email" value={data.email} copyable onCopy={() => copyToClipboard(data.email, 'Email')} />
              <InfoRow icon={Phone} label="Personal Phone" value={data.phone} copyable onCopy={() => data.phone && copyToClipboard(data.phone, 'Phone')} />
              {data.referral_code && (
                <InfoRow icon={Hash} label="Referral Code" value={data.referral_code} copyable onCopy={() => copyToClipboard(data.referral_code, 'Referral Code')} />
              )}
            </div>
            {/* Business */}
            <div className="space-y-3">
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.15em] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Business Details
              </p>
              <InfoRow icon={Briefcase} label="Business Name" value={data.business_name} />
              <InfoRow icon={Mail} label="Business Email" value={data.business_email} copyable onCopy={() => data.business_email && copyToClipboard(data.business_email, 'Business Email')} />
              <InfoRow icon={Phone} label="Business Phone" value={data.business_phone} copyable onCopy={() => data.business_phone && copyToClipboard(data.business_phone, 'Business Phone')} />
              {data.business_website && (
                <InfoRow icon={Globe} label="Website" value={data.business_website} link />
              )}
            </div>
            {/* Legal / Address */}
            <div className="space-y-3">
              <p className="text-[10px] text-purple-400 uppercase tracking-[0.15em] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Legal & Address
              </p>
              <InfoRow icon={FileText} label="GSTIN" value={data.gstin} />
              <InfoRow icon={FileText} label="PAN" value={data.pan_number} />
              <InfoRow icon={MapPin} label="Address" value={data.business_address} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ METRICS ROW ═══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Lifetime Value" value={`₹${data.metrics.ltv.toLocaleString('en-IN')}`} icon={IndianRupee} gradient="from-purple-500 to-pink-500" delay={0} />
        <KpiCard title="Total Orders" value={data.metrics.orders_count} icon={ShoppingCart} gradient="from-blue-500 to-cyan-500" delay={1} />
        <KpiCard title="Enquiries" value={data.metrics.enquiries_count} icon={MessageSquare} gradient="from-amber-500 to-orange-500" delay={2} />
        <KpiCard title="Avg Order Value" value={`₹${data.metrics.aov.toLocaleString('en-IN')}`} icon={TrendingUp} gradient="from-emerald-500 to-teal-500" delay={3} />
        <KpiCard title="Days as Customer" value={data.metrics.days_as_customer} icon={Calendar} gradient="from-indigo-500 to-blue-500" delay={4} />
        <KpiCard
          title="Sub. Remaining"
          value={isSubscribed ? `${data.metrics.sub_days_remaining}d` : 'Free'}
          icon={isSubscribed ? ShieldCheck : ShieldAlert}
          gradient={isSubscribed ? 'from-emerald-500 to-green-500' : 'from-gray-500 to-gray-600'}
          delay={5}
        />
      </div>

      {/* ═══════════════ TABBED CONTENT AREA ═══════════════ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/[0.03] border border-white/5 rounded-xl p-1 h-auto flex-wrap gap-1">
          {[
            { value: 'overview', label: 'Overview', icon: Activity },
            { value: 'orders', label: 'Orders', icon: ShoppingCart },
            { value: 'enquiries', label: 'Enquiries', icon: MessageSquare },
            { value: 'subscription', label: 'Subscription', icon: CreditCard },
            { value: 'activity', label: 'Activity', icon: History },
            { value: 'referrals', label: 'Referrals', icon: Users },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none text-gray-400 rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ──── OVERVIEW TAB ──── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Info Cards */}
            <div className="space-y-6">
              {/* Business Profile */}
              <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" /> Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Business Name</Label>
                    <p className="text-white font-medium">{data.business_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Products Listed</Label>
                    <p className="text-white font-medium">{data.metrics.products_count}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Wallet</Label>
                    <p className="text-white font-medium">₹{data.wallet_balance?.toLocaleString('en-IN') || '0'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Info */}
              {data.referredBy && (
                <Card className="border border-white/5 bg-white/[0.02]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Star className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Referred By</p>
                      <p className="text-sm text-white font-medium">{data.referredBy.referrer?.full_name || 'Unknown'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Orders */}
              <Card className="border border-white/5 bg-white/[0.02]">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-400" /> Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {data.recentOrders.length > 0 ? data.recentOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-medium">#{order.order_number || order.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-gray-500">{format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white font-semibold">₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}</span>
                          <StatusBadge status={order.status || 'pending'} size="sm" />
                        </div>
                      </div>
                    )) : (
                      <p className="py-8 text-center text-xs text-gray-500 italic">No orders yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="border border-white/5 bg-white/[0.02]">
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-400" /> Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {data.recentTransactions.length > 0 ? data.recentTransactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', tx.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                            <CreditCard className={cn('w-4 h-4', tx.status === 'success' ? 'text-emerald-400' : 'text-red-400')} />
                          </div>
                          <div>
                            <p className="text-xs text-white font-medium font-mono">TXN_{tx.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-gray-500">{format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn('text-sm font-semibold', tx.status === 'success' ? 'text-emerald-400' : 'text-red-400')}>
                            ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}
                          </span>
                          <StatusBadge status={tx.status || 'pending'} size="sm" />
                        </div>
                      </div>
                    )) : (
                      <p className="py-8 text-center text-xs text-gray-500 italic">No transactions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ──── ORDERS TAB ──── */}
        <TabsContent value="orders">
          <Card className="border border-white/5 bg-white/[0.02] overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-base text-gray-200 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                All Orders ({data.metrics.orders_count})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.03] border-b border-white/5">
                    <TableRow>
                      <TableHead className="text-gray-400 font-semibold">Order #</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Amount</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Profit</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentOrders.length > 0 ? data.recentOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-white/[0.02] border-b border-white/5">
                        <TableCell className="text-white font-mono text-xs">#{order.order_number || order.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{format(new Date(order.created_at), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-white font-semibold text-sm">₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-emerald-400 text-sm">₹{parseFloat(order.total_profit || order.profit || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell><StatusBadge status={order.status || 'pending'} size="sm" /></TableCell>
                        <TableCell><StatusBadge status={order.payment_status || 'unpaid'} size="sm" /></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500 italic">No orders found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── ENQUIRIES TAB ──── */}
        <TabsContent value="enquiries">
          <Card className="border border-white/5 bg-white/[0.02] overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-base text-gray-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                All Enquiries ({data.metrics.enquiries_count})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.03] border-b border-white/5">
                    <TableRow>
                      <TableHead className="text-gray-400 font-semibold">Customer</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Phone</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Message</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Source</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-400 font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentEnquiries.length > 0 ? data.recentEnquiries.map(enq => (
                      <TableRow key={enq.id} className="hover:bg-white/[0.02] border-b border-white/5">
                        <TableCell className="text-white text-sm">{enq.customer_name || '—'}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{enq.phone || '—'}</TableCell>
                        <TableCell className="text-gray-300 text-xs max-w-[250px] truncate">{enq.message}</TableCell>
                        <TableCell><StatusBadge status={enq.source || 'whatsapp'} size="sm" /></TableCell>
                        <TableCell><StatusBadge status={enq.status || 'new'} size="sm" /></TableCell>
                        <TableCell className="text-gray-400 text-xs">{format(new Date(enq.created_at), 'dd MMM yyyy')}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500 italic">No enquiries found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── SUBSCRIPTION TAB ──── */}
        <TabsContent value="subscription">
          <Card className="border border-white/5 bg-white/[0.02] relative overflow-hidden">
            {isSubscribed && <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />}
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-gray-200">Subscription Management</CardTitle>
                <CardDescription className="text-xs">Current plan and billing details</CardDescription>
              </div>
              {isSubscribed ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 text-gray-500" />}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <CreditCard className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{data.subscription?.plan?.display_name || 'Free Version'}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{data.subscription?.status || 'No active plan'}</p>
                    </div>
                  </div>

                  {isSubscribed && (
                    <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Plan Price</span>
                        <span className="text-white font-semibold">₹{data.subscription?.plan?.price?.toLocaleString('en-IN') || '0'}/{data.subscription?.plan?.billing_period || 'month'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Period Start</span>
                        <span className="text-gray-300">{format(new Date(data.subscription!.current_period_start), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500">Valid Until</span>
                        <span className={new Date(data.subscription!.current_period_end) < new Date() ? 'text-red-400' : 'text-emerald-400'}>
                          {format(new Date(data.subscription!.current_period_end), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Days Remaining</span>
                        <span className={cn('font-bold', data.metrics.sub_days_remaining < 7 ? 'text-red-400' : 'text-white')}>
                          {data.metrics.sub_days_remaining} days
                        </span>
                      </div>
                    </div>
                  )}

                  {!isSubscribed && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Account is on Free Plan
                      </p>
                      <p className="text-[10px] text-amber-500/70 mt-1 italic">Some features may be locked for this user.</p>
                    </div>
                  )}
                </div>

                {/* Administrative Actions */}
                <div className="space-y-4 border-l border-white/5 pl-0 md:pl-8">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Administrative Actions</p>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <Unlock className="w-3.5 h-3.5" /> Force Unlock / Extend (30 Days)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plans.filter(p => p.name !== 'free').map(plan => (
                        <Button
                          key={plan.id}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10px] h-8"
                          onClick={() => handleSubscriptionAction('unlock', plan.id)}
                          disabled={actionLoading}
                        >
                          <Zap className="w-3 h-3 mr-1" /> {plan.display_name}
                        </Button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500">* Overrides current plan or activates new one for 30 days.</p>
                  </div>

                  {/* Payment History */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">Recent Payments</p>
                    {data.recentTransactions.slice(0, 3).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                        <div>
                          <span className="text-white font-mono">{tx.id.slice(0, 8)}</span>
                          <span className="text-gray-500 ml-2">{format(new Date(tx.created_at), 'dd MMM')}</span>
                        </div>
                        <span className={tx.status === 'success' ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                          ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── ACTIVITY TIMELINE TAB ──── */}
        <TabsContent value="activity">
          <Card className="border border-white/5 bg-white/[0.02]">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-base text-gray-200 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Activity Timeline
              </CardTitle>
              <CardDescription className="text-xs">Complete history of user actions on the platform</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ActivityTimeline
                events={data.timeline}
                emptyMessage="No activity recorded for this customer yet"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── REFERRALS TAB ──── */}
        <TabsContent value="referrals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referred By */}
            <Card className="border border-white/5 bg-white/[0.02]">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Referred By
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {data.referredBy ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      {data.referredBy.referrer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{data.referredBy.referrer?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{data.referredBy.referrer?.email}</p>
                    </div>
                    <StatusBadge status={data.referredBy.status} size="sm" className="ml-auto" />
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 italic py-6">No referrer found — joined organically</p>
                )}
              </CardContent>
            </Card>

            {/* People They Referred */}
            <Card className="border border-white/5 bg-white/[0.02]">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> People Referred ({data.referrals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {data.referrals.length > 0 ? (
                  <div className="space-y-3">
                    {data.referrals.map(ref => (
                      <div key={ref.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                          {ref.referee?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{ref.referee?.full_name || 'Unknown'}</p>
                          <p className="text-[10px] text-gray-500 truncate">{ref.referee?.email}</p>
                        </div>
                        <StatusBadge status={ref.status} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 italic py-6">No referrals yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════ MESSAGING DIALOG ═══════════════ */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Send Notification
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">
              Message will appear in {data.full_name || 'user'}'s notification center.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-gray-400">Title</Label>
              <Input id="title" placeholder="e.g., Subscription Ending Soon" value={msgTitle} onChange={e => setMsgTitle(e.target.value)} className="bg-white/5 border-white/10 text-white" />
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
              <Label htmlFor="message" className="text-xs text-gray-400">Message</Label>
              <Textarea id="message" placeholder="Write your message..." value={msgBody} onChange={e => setMsgBody(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMsgOpen(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={handleSendMessage} disabled={sendingMsg} className="bg-emerald-500 hover:bg-emerald-600">
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ──────────────────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
  onCopy,
  link,
}: {
  icon: any
  label: string
  value?: string | null
  copyable?: boolean
  onCopy?: () => void
  link?: boolean
}) {
  if (!value) {
    return (
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
          <p className="text-xs text-gray-500 italic">Not provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 group">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 group-hover:text-emerald-400 transition-colors" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
        {link ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block">
            {value}
          </a>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-white truncate">{value}</p>
            {copyable && onCopy && (
              <button onClick={onCopy} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3 text-gray-500 hover:text-emerald-400" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

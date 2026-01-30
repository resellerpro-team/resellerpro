'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ArrowRight,
  IndianRupee,
  Clock,
  History,
  Unlock,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface CustomerDetail {
  id: string
  full_name: string
  email: string
  phone: string
  business_name: string
  created_at: string
  updated_at: string
  wallet_balance: number
  subscription?: {
    status: string
    current_period_start: string
    current_period_end: string
    plan?: {
      id: string
      display_name: string
      name: string
      price: number
    }
  }
  business?: {
    id: string
    name: string
    status: string
  }
  orders_count: { count: number }[]
  enquiries_count: { count: number }[]
  recentOrders: any[]
  recentTransactions: any[]
}

export default function EkodrixCustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  
  // Messaging state
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgPriority, setMsgPriority] = useState('normal')
  const [sendingMsg, setSendingMsg] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ekodrix-panel/customers/${id}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }

      // Also fetch available plans for the unlock feature
      const plansRes = await fetch('/api/ekodrix-panel/plans')
      const plansData = await plansRes.json()
      if (plansData.success) {
        setPlans(plansData.data)
      }
    } catch (error) {
      console.error('Failed to fetch customer detail:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    } catch (error) {
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
        body: JSON.stringify({
          userId: id,
          title: msgTitle,
          message: msgBody,
          priority: msgPriority
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Sent', description: 'Message delivered to user notification center' })
        setMsgOpen(false)
        setMsgTitle('')
        setMsgBody('')
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' })
    } finally {
      setSendingMsg(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Customer not found</div>

  const isSubscribed = data.subscription?.status === 'active'

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" className="text-gray-400 hover:text-white mb-2" onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Customers
      </Button>

      {/* Profile Header Card */}
      <Card className="border border-white/5 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-transparent backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/20">
              {data.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{data.full_name || 'No Name'}</h1>
                <Badge className={isSubscribed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400 border-white/10"}>
                  {data.subscription?.plan?.display_name || 'Free Plan'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-500/60" />
                  {data.email}
                </div>
                {data.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-500/60" />
                    {data.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500/60" />
                  Joined {data.updated_at ? format(new Date(data.updated_at), 'MMMM dd, yyyy') : 'Recently'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Wallet Balance</p>
                <p className="text-2xl font-bold text-white">₹{data.wallet_balance?.toLocaleString() || '0'}</p>
              </div>
              <Button 
                onClick={() => setMsgOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business & Stats */}
        <div className="space-y-6">
          {/* Business Info */}
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base text-gray-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <Label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Business Name</Label>
                <p className="text-white font-medium">{data.business_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Store Status</Label>
                <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                  {data.business?.status || 'Unknown'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-gray-300 h-9 text-xs" asChild>
                <Link href={`#`}>
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View Storefront
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base text-gray-200">System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-xl font-bold text-white">{data.orders_count?.[0]?.count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Enquiries</p>
                <p className="text-xl font-bold text-white">{data.enquiries_count?.[0]?.count || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscription & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Management */}
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
            {isSubscribed && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />}
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-gray-200">Subscription Status</CardTitle>
                <CardDescription className="text-xs">Current plan and billing details</CardDescription>
              </div>
              {isSubscribed ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 text-gray-500" />}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{data.subscription?.plan?.display_name || 'Free Version'}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{data.subscription?.status || 'No active plan'}</p>
                    </div>
                  </div>
                  
                  {isSubscribed && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Period Start</span>
                        <span className="text-gray-300">{format(new Date(data.subscription!.current_period_start), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500">Valid Until</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className={new Date(data.subscription!.current_period_end) < new Date() ? "text-red-400" : "text-emerald-400"}>
                            {format(new Date(data.subscription!.current_period_end), 'dd MMM yyyy')}
                          </span>
                          {isSubscribed && new Date(data.subscription!.current_period_end).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && (
                            <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-500 px-1 py-0 h-4 bg-amber-500/5 anim-pulse">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isSubscribed && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Account is on Free Plan
                      </p>
                      <p className="text-[10px] text-amber-500/70 mt-1 italic">
                        Some features may be locked for this user.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-l border-white/5 pl-0 md:pl-8">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Administrative Actions</p>
                  <div className="grid gap-2">
                    {/* Manual Unlock Feature */}
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <Unlock className="w-3.5 h-3.5" />
                        Force Unlock / Extend
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plans.filter(p => p.name !== 'free').map(plan => (
                          <Button 
                            key={plan.id}
                            size="sm" 
                            variant="secondary" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10px] h-7"
                            onClick={() => handleSubscriptionAction('unlock', plan.id)}
                            disabled={actionLoading}
                          >
                            {plan.display_name}
                          </Button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500">
                        * Overrides current plan or activates new one for 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {data.recentOrders.length > 0 ? data.recentOrders.map((order) => (
                    <div key={order.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.01]">
                      <div>
                        <p className="text-xs text-white font-medium">#{order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-gray-500">{format(new Date(order.created_at), 'dd MMM, HH:mm')}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-white/10 text-gray-400 capitalize">
                        {order.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="p-8 text-center text-xs text-gray-500">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {data.recentTransactions.length > 0 ? data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.01]">
                      <div>
                        <p className="text-xs text-white font-medium">₹{tx.amount?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">{format(new Date(tx.created_at), 'dd MMM, HH:mm')}</p>
                      </div>
                      <Badge className={`text-[9px] border-0 capitalize ${
                        tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="p-8 text-center text-xs text-gray-500">No transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Messaging Dialog */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Send Individual Message</DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">
              This message will appear in the user's notification center.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-gray-400">Message Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Subscription Ending Soon" 
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs text-gray-400">Priority</Label>
              <Select value={msgPriority} onValueChange={setMsgPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High (Red Alert)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs text-gray-400">Message Body</Label>
              <Textarea 
                id="message" 
                placeholder="Write your message here..." 
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:ring-emerald-500 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMsgOpen(false)} className="text-gray-400">Cancel</Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={sendingMsg}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
            >
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Dispatch Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

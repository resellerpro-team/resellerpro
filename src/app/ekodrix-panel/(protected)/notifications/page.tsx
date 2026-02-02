'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Bell,
  Send,
  Loader2,
  AlertCircle,
  Megaphone,
  History,
  CheckCircle,
  Users,
  ShieldAlert,
  Construction,
  Sparkles,
  Info,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  created_at: string
  profile?: {
    full_name: string
    email: string
  }
}

export default function EkodrixNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  // Form states
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [type, setType] = useState('system')
  const [target, setTarget] = useState('all')

  const AGENTIC_TEMPLATES = [
    {
      id: 'welcome',
      label: 'Welcome Tip',
      title: '🌟 Welcome to ResellerPro!',
      message: 'Unlock your potential! Complete your store profile today to start receiving orders faster. Our AI helps you optimize your listings.',
      type: 'marketing',
      priority: 'low'
    },
    {
      id: 'growth',
      label: 'Growth Insight',
      title: '📈 Scale Your Business',
      message: 'Did you know? Users who check their Analytics daily grow 30% faster. Explore your top-performing products now!',
      type: 'marketing',
      priority: 'normal'
    },
    {
      id: 'security',
      label: 'Security Check',
      title: '🛡️ Account Security Alert',
      message: 'Critical: Please ensure your account has 2FA enabled. We detected a login from a new device. Is this you?',
      type: 'security',
      priority: 'high'
    },
    {
      id: 'maintenance',
      label: 'System Maintenance',
      title: '⚙️ Scheduled Maintenance',
      message: 'Heads up! We’ll be performing a quick upgrade tonight at 2 AM UTC. The panel might be slow for 15 minutes.',
      type: 'maintenance',
      priority: 'normal'
    }
  ]

  const applyTemplate = (tpl: any) => {
    setTitle(tpl.title)
    setMessage(tpl.message)
    setType(tpl.type)
    setPriority(tpl.priority)
    toast({ title: 'Template Applied', description: `Loaded: ${tpl.label}` })
  }

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/ekodrix-panel/notifications')
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !message) return

    setSending(true)
    try {
      const response = await fetch('/api/ekodrix-panel/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, priority, type, target }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Success', description: result.message })
        setTitle('')
        setMessage('')
        fetchNotifications()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send broadcast', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const getTypeStyles = (t: string, p: string) => {
    if (p === 'high') return { color: 'text-red-500', icon: ShieldAlert, label: 'CRITICAL' }
    if (p === 'low' || t === 'marketing') return { color: 'text-emerald-500', icon: Sparkles, label: 'INSIGHT' }
    
    switch (t) {
       case 'security': return { color: 'text-red-400', icon: ShieldAlert, label: 'SECURITY' }
       case 'maintenance': return { color: 'text-amber-400', icon: Construction, label: 'MAINTENANCE' }
       case 'marketing': return { color: 'text-emerald-400', icon: Sparkles, label: 'MARKETING' }
       default: return { color: 'text-blue-400', icon: Info, label: 'SYSTEM' }
    }
  }

  const preview = getTypeStyles(type, priority)

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Megaphone className="w-8 h-8 text-emerald-500 group-hover:rotate-12 transition-transform" />
            </div>
            Universal Broadcast
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Communicate with your entire user base using high-impact semantic notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Broadcast Form */}
        <div className="xl:col-span-7 space-y-6">
          {/* Templates Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {AGENTIC_TEMPLATES.map(tpl => (
                <Button 
                   key={tpl.id}
                   variant="outline" 
                   onClick={() => applyTemplate(tpl)}
                   className="h-auto py-3 px-4 bg-white/5 border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all rounded-2xl flex flex-col items-start gap-1 group"
                >
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{tpl.label}</span>
                   <span className="text-[11px] text-gray-400 font-bold group-hover:text-white transition-colors">Quick Apply</span>
                </Button>
             ))}
          </div>

          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative shadow-2xl rounded-3xl">
            <CardHeader className="border-b border-white/5 pb-6 pt-8 px-8">
              <div className="flex items-center gap-3 text-emerald-400">
                <Send className="w-5 h-5" />
                <CardTitle className="text-white text-xl font-bold">New Broadcast Campaign</CardTitle>
              </div>
              <CardDescription className="text-gray-500 font-medium">Select a category and priority to reach your users effectively.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] pl-1">Target Audience</label>
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-gray-200 h-14 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-2xl">
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="new_users">New Users (7 Days)</SelectItem>
                        <SelectItem value="pro_users">Active Subscribers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-white">
                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] pl-1">Category</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-gray-200 h-14 rounded-2xl focus:ring-emerald-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-2xl overflow-hidden">
                        <SelectItem value="system" className="focus:bg-emerald-500/10">System Update</SelectItem>
                        <SelectItem value="security" className="focus:bg-red-500/10">Security Alert</SelectItem>
                        <SelectItem value="maintenance" className="focus:bg-amber-500/10">Maintenance</SelectItem>
                        <SelectItem value="marketing" className="focus:bg-emerald-500/10">Marketing / Tips</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-white">
                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] pl-1">Priority Level</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-gray-200 h-14 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-2xl">
                        <SelectItem value="low" className="text-emerald-500 focus:bg-emerald-500/10 font-bold">Low (Info)</SelectItem>
                        <SelectItem value="normal" className="text-blue-400 focus:bg-blue-500/10 font-bold">Normal</SelectItem>
                        <SelectItem value="high" className="text-red-500 focus:bg-red-500/10 font-bold italic">High (Alert)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] pl-1">Message Title</label>
                  <Input 
                    placeholder="e.g. Critical Security Patch Available" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-emerald-500 transition-all font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] pl-1">Internal Message</label>
                  <Textarea 
                    placeholder="Provide full details of the announcement..." 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-emerald-500 transition-all min-h-[140px] rounded-2xl p-4 font-medium leading-relaxed"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={sending || !title || !message} 
                  className={cn(
                    "w-full text-white font-black h-16 shadow-2xl transition-all rounded-2xl text-lg uppercase tracking-widest active:scale-95",
                    priority === 'high' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  )}
                >
                  {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                   `Dispatch to ${target === 'all' ? 'Everyone' : 
                                 target === 'new_users' ? 'New Users' : 'Subscribers'}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview & Audit Log */}
        <div className="xl:col-span-5 space-y-6">
          {/* Real-time User Preview */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 pl-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End-User Live Preview</span>
             </div>
             <div className={cn(
                "p-6 rounded-3xl border transition-all duration-500 flex gap-4 backdrop-blur-xl relative overflow-hidden",
                priority === 'high' ? "bg-red-500/[0.03] border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : 
                priority === 'low' ? "bg-emerald-500/[0.03] border-emerald-500/20" : "bg-white/[0.02] border-white/5"
             )}>
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-500 hover:scale-110",
                  priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                  priority === 'low' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>
                  <preview.icon className={cn("w-7 h-7", priority === 'high' && "animate-pulse")} />
                </div>
                <div className="space-y-2 flex-1">
                   <div className="flex items-center justify-between">
                      <h4 className="text-white font-black text-base">{title || 'Message Title'}</h4>
                      <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", 
                        priority === 'high' ? "bg-red-500/20 text-red-500" : 
                        priority === 'low' ? "bg-emerald-500/20 text-emerald-500" : "bg-blue-500/10 text-blue-400"
                      )}>
                        {preview.label}
                      </div>
                   </div>
                   <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                     {message || 'Type your internal message to see the user preview here. Semantic colors and icons adjust automatically.'}
                   </p>
                </div>
                {priority === 'high' && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 blur-xl rounded-full -mr-8 -mt-8" />
                )}
             </div>
          </div>

          <Card className="border border-white/5 bg-white/[0.01] backdrop-blur-sm h-full flex flex-col rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4 bg-white/5 px-8 flex flex-row items-center justify-between py-6">
              <div className="flex items-center gap-3 text-blue-400">
                <History className="w-5 h-5" />
                <CardTitle className="text-white text-lg font-bold">Audit History</CardTitle>
              </div>
              <Badge variant="outline" className="border-white/10 text-gray-500 text-[10px] font-bold">RECENT 15</Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-600 font-medium italic">No communication history.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => {
                    const styles = getTypeStyles(n.type, n.priority)
                    return (
                      <div key={n.id} className="p-6 hover:bg-white/[0.02] transition-all group border-l-4 border-transparent hover:border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <div className={cn("p-1.5 rounded-lg bg-white/5", styles.color)}>
                               <styles.icon size={14} />
                             </div>
                             <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", styles.color)}>
                               {styles.label}
                             </span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-black tracking-tighter uppercase whitespace-nowrap">
                            {format(new Date(n.created_at), 'dd MMM | hh:mm a')}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-200 group-hover:text-emerald-400 transition-colors">{n.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-2 font-medium leading-normal">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-black mt-4 pt-3 border-t border-white/5 uppercase tracking-tighter">
                          <Users className="w-3 h-3 text-gray-700" />
                          To: {n.profile?.full_name || 'Global Broadcast'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

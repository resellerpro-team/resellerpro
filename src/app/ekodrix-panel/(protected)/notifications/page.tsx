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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
        body: JSON.stringify({ title, message, priority, target: 'all' }),
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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-emerald-500" />
            Communication Center
          </h1>
          <p className="text-gray-400 mt-1">Broadcast announcements and monitor system alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Broadcast Form */}
        <div className="space-y-6">
          <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Megaphone className="w-24 h-24 text-emerald-500" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <Send className="w-5 h-5" />
                <CardTitle className="text-white text-lg">Send Global Broadcast</CardTitle>
              </div>
              <CardDescription className="text-xs">This will notify all users on the platform immediately.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest pl-1">Notification Title</label>
                  <Input 
                    placeholder="e.g. System Maintenance Update" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-11 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest pl-1">Message Content</label>
                  <Textarea 
                    placeholder="Enter the detailed message for all users..." 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-emerald-500 transition-all min-h-[120px]"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest pl-1">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300">
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={sending || !title || !message} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-500/20 mt-4 rounded-xl"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Dispatch Broadcast'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-emerald-500/5 p-4 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
             <p className="text-[11px] text-emerald-200/60 leading-relaxed font-medium">
               <strong className="text-emerald-400">Pro Tip:</strong> High priority notifications will show up as persistent alerts for users. Use sparingly for critical updates only.
             </p>
          </Card>
        </div>

        {/* Recent History */}
        <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-sm h-full flex flex-col">
          <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
            <div className="flex items-center gap-3 text-blue-400">
              <History className="w-5 h-5" />
              <CardTitle className="text-white text-lg">Communication Audit Log</CardTitle>
            </div>
            <CardDescription className="text-xs">History of system alerts and broadcasts sent.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500 italic">No communication history.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-5 hover:bg-white/[0.01] transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        "text-[9px] uppercase font-bold tracking-widest border-0",
                        n.priority === 'high' ? "bg-red-500/20 text-red-400" :
                        n.priority === 'normal' ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"
                      )}>
                        {n.priority}
                      </Badge>
                      <span className="text-[10px] text-gray-600 font-medium">
                        {format(new Date(n.created_at), 'dd MMM, hh:mm a')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-200">{n.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 font-medium pt-1">
                      <Users className="w-3 h-3" />
                      TO: {n.profile?.full_name || 'System Broadcast'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

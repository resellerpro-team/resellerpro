'use client'

import { cn } from '@/lib/utils'
import {
  LogIn, UserPlus, ShoppingCart, MessageSquare,
  CreditCard, Settings, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, Star, Bell, Package,
  type LucideIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

export interface TimelineEvent {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, any>
}

const EVENT_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string; ring: string }> = {
  login:        { icon: LogIn,          color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' },
  signup:       { icon: UserPlus,       color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' },
  order:        { icon: ShoppingCart,   color: 'text-blue-400',    bg: 'bg-blue-500/15',    ring: 'ring-blue-500/30' },
  enquiry:      { icon: MessageSquare,  color: 'text-blue-400',    bg: 'bg-blue-500/15',    ring: 'ring-blue-500/30' },
  payment:      { icon: CreditCard,     color: 'text-purple-400',  bg: 'bg-purple-500/15',  ring: 'ring-purple-500/30' },
  subscription: { icon: Star,           color: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/30' },
  profile:      { icon: Settings,       color: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/30' },
  shipped:      { icon: Package,        color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    ring: 'ring-cyan-500/30' },
  delivered:    { icon: CheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' },
  cancelled:    { icon: XCircle,        color: 'text-red-400',     bg: 'bg-red-500/15',     ring: 'ring-red-500/30' },
  failed:       { icon: AlertTriangle,  color: 'text-red-400',     bg: 'bg-red-500/15',     ring: 'ring-red-500/30' },
  notification: { icon: Bell,           color: 'text-indigo-400',  bg: 'bg-indigo-500/15',  ring: 'ring-indigo-500/30' },
  refund:       { icon: RefreshCw,      color: 'text-purple-400',  bg: 'bg-purple-500/15',  ring: 'ring-purple-500/30' },
}

const DEFAULT_EVENT = { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-500/15', ring: 'ring-gray-500/30' }

interface ActivityTimelineProps {
  events: TimelineEvent[]
  maxItems?: number
  emptyMessage?: string
  className?: string
}

export function ActivityTimeline({
  events,
  maxItems,
  emptyMessage = 'No activity found',
  className,
}: ActivityTimelineProps) {
  const displayed = maxItems ? events.slice(0, maxItems) : events

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-3">
        <Bell className="w-10 h-10 opacity-20" />
        <p className="text-sm italic">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      <div className="space-y-1">
        {displayed.map((event, idx) => {
          const config = EVENT_CONFIG[event.type] || DEFAULT_EVENT
          const Icon = config.icon

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="flex items-start gap-4 py-3 px-2 rounded-xl hover:bg-white/[0.02] transition-colors group"
            >
              {/* Icon node */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-xl ring-1 shrink-0 transition-transform group-hover:scale-110',
                config.bg, config.ring,
              )}>
                <Icon className={cn('w-4 h-4', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-white font-medium truncate">{event.title}</p>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{event.description}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return format(date, 'dd MMM yyyy')
  } catch {
    return ''
  }
}

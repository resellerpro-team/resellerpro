'use client'

import { useState, useEffect } from 'react'
import {
    Bell,
    CheckCheck,
    X,
    AlertCircle,
    Wallet,
    Package as PackageIcon,
    MessageSquare,
    Info,
    ShoppingBag,
    Sparkles,
    UserPlus,
    BellOff,
    ArrowRight,
    Clock
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: string
    user_id: string
    type: string
    priority: 'high' | 'normal' | 'low'
    title: string
    message: string
    entity_type: string
    entity_id: string | null
    is_read: boolean
    read_at: string | null
    created_at: string
    metadata?: {
        action_url?: string
        action_label?: string
    }
}

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

export function NotificationDrawer() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.data) {
                const newNotifications = data.data
                setNotifications(newNotifications)

                const newUnreadCount = newNotifications.filter((n: Notification) => !n.is_read).length

                // Alert / Auto-Open Logic for High Priority
                const newHighPriority = newNotifications.find((n: Notification) => n.priority === 'high' && !n.is_read && n.id !== lastNotifiedId)
                if (newHighPriority) {
                    setLastNotifiedId(newHighPriority.id)
                    setIsPopoverOpen(true) // Auto-open the popover signal
                }

                setUnreadCount(newUnreadCount)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                body: JSON.stringify({ notificationId: id }),
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                body: JSON.stringify({ all: true }),
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    useEffect(() => {
        fetchNotifications()

        const supabase = createClient()

        // Listen for new notifications in real-time
        const channel = supabase
            .channel('notifications_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(prev => prev + 1)

                    // High Priority Auto-Open Trigger
                    if (newNotif.priority === 'high') {
                        setIsPopoverOpen(true)
                        setLastNotifiedId(newNotif.id)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const unreadNotifications = notifications.filter(n => !n.is_read)
    const readNotifications = notifications.filter(n => n.is_read)
    const recentReadNotifications = readNotifications.slice(0, 10)

    // Check if there are any unread high priority items for the signal
    const hasHighPriorityUnread = unreadNotifications.some(n => n.priority === 'high')

    return (
        <>
            <Popover open={isPopoverOpen} onOpenChange={(open) => {
                setIsPopoverOpen(open)
                if (open) fetchNotifications()
            }}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                        <Bell className={cn(
                            "h-5 w-5",
                            unreadCount > 0 && "text-primary animate-ring",
                            hasHighPriorityUnread && "text-red-500"
                        )} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                <span className={cn(
                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                    hasHighPriorityUnread ? "bg-red-500" : "bg-primary"
                                )}></span>
                                <span className={cn(
                                    "relative inline-flex rounded-full h-2.5 w-2.5",
                                    hasHighPriorityUnread ? "bg-red-500" : "bg-primary"
                                )}></span>
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0 flex flex-col shadow-2xl border-primary/5 rounded-2xl overflow-hidden backdrop-blur-xl bg-background/95" align="end">
                    <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge variant="default" className={cn(
                                        "h-5 px-1.5 text-[10px]",
                                        hasHighPriorityUnread ? "bg-red-500" : "bg-primary"
                                    )}>
                                        {unreadCount}
                                    </Badge>
                                )}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs font-semibold text-primary hover:bg-primary/5"
                                    onClick={markAllAsRead}
                                >
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setIsPopoverOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="unread" className="flex flex-col">
                        <TabsList className="flex w-full rounded-none border-b bg-background/50 h-10 p-1">
                            <TabsTrigger
                                value="unread"
                                className="flex-1 text-xs font-bold data-[state=active]:bg-muted/50 data-[state=active]:shadow-none"
                            >
                                Unread
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex-1 text-xs font-bold data-[state=active]:bg-muted/50 data-[state=active]:shadow-none"
                            >
                                History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="unread" className="m-0 p-0 outline-none">
                            <ScrollArea className="h-[400px]">
                                <div className="p-3 space-y-3">
                                    {unreadNotifications.length === 0 ? (
                                        <EmptyState
                                            icon={Sparkles}
                                            title="All caught up!"
                                            message="You have no unread notifications at the moment."
                                        />
                                    ) : (
                                        unreadNotifications.map(notification => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                                compact
                                                onMarkRead={() => markAsRead(notification.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="history" className="m-0 p-0 outline-none">
                            <ScrollArea className="h-[400px]">
                                <div className="p-3 space-y-3">
                                    {recentReadNotifications.length === 0 ? (
                                        <EmptyState
                                            icon={BellOff}
                                            title="Empty History"
                                            message="Recent notifications will appear here."
                                        />
                                    ) : (
                                        recentReadNotifications.map(notification => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                                compact
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>

                    <div className="p-3 border-t bg-muted/20">
                        <Button
                            variant="default"
                            className="w-full h-10 text-xs font-bold group rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => {
                                setIsPopoverOpen(false)
                                setIsDrawerOpen(true)
                            }}
                        >
                            View all activity
                            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l shadow-2xl rounded-l-[2rem] overflow-hidden">
                    <SheetHeader className="p-6 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <SheetTitle className="text-2xl font-black tracking-tight">Activity Log</SheetTitle>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Keep track of everything happening in your business
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-muted/50"
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-2">
                            <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-muted/30">
                                {unreadCount} {unreadCount === 1 ? 'New Action' : 'New Actions'}
                            </Badge>
                            {unreadCount > 0 && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs font-bold text-primary h-auto p-0"
                                    onClick={markAllAsRead}
                                >
                                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    <Tabs defaultValue="action" className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 py-4 bg-muted/10">
                            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-background/50 border shadow-sm rounded-xl">
                                <TabsTrigger
                                    value="action"
                                    className="text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                                >
                                    Needs Attention
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                                >
                                    Full History
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="action" className="m-0 flex-1 min-h-0 outline-none data-[state=active]:flex flex-col">
                            <ScrollArea className="flex-1 min-h-0">
                                <div className="p-4 space-y-4 pb-12">
                                    {unreadNotifications.length === 0 ? (
                                        <EmptyState
                                            icon={Sparkles}
                                            title="No pending tasks"
                                            message="You're all caught up! Take a moment to celebrate."
                                        />
                                    ) : (
                                        unreadNotifications.map(notification => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                                onMarkRead={() => markAsRead(notification.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="history" className="m-0 flex-1 min-h-0 outline-none data-[state=active]:flex flex-col">
                            <ScrollArea className="flex-1 min-h-0">
                                <div className="p-4 space-y-4 pb-12">
                                    {readNotifications.length === 0 ? (
                                        <EmptyState
                                            icon={BellOff}
                                            title="History is empty"
                                            message="A log of your previous activity will appear here."
                                        />
                                    ) : (
                                        readNotifications.map(notification => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>
        </>
    )
}

function NotificationCard({
    notification,
    onMarkRead,
    compact = false
}: {
    notification: Notification
    onMarkRead?: (() => void) | (() => Promise<void>) | (() => Promise<any>)
    compact?: boolean
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const getIconConfig = (type: string, priority: string) => {
        if (priority === 'high') {
            return { icon: AlertCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", glow: "shadow-[0_0_12px_rgba(239,68,68,0.2)]" }
        }

        if (priority === 'low' || type === 'marketing') {
            return { icon: Sparkles, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", glow: "" }
        }

        switch (type) {
            case 'enquiry_followup_due':
                return { icon: MessageSquare, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", glow: "" }
            case 'wallet_credited':
                return { icon: Wallet, color: "bg-green-500/10 text-green-500 border-green-500/20", glow: "" }
            case 'subscription_expiring_soon':
                return { icon: AlertCircle, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", glow: "" }
            case 'low_stock':
                return { icon: PackageIcon, color: "bg-red-500/10 text-red-500 border-red-500/20", glow: "" }
            case 'new_order':
                return { icon: ShoppingBag, color: "bg-primary/10 text-primary border-primary/20", glow: "" }
            case 'new_customer':
                return { icon: UserPlus, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", glow: "" }
            default:
                return { icon: Bell, color: "bg-muted text-muted-foreground border-border", glow: "" }
        }
    }

    const { priority, is_read, title, message, created_at } = notification
    const { icon: Icon, color, glow } = getIconConfig(notification.type, notification.priority)

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "group relative flex gap-4 rounded-2xl border transition-all duration-300 cursor-pointer",
                compact ? "p-3.5 gap-3" : "p-5 gap-4",
                !is_read
                    ? "bg-card border-primary/15 shadow-[0_4px_12px_-4px_rgba(var(--primary),0.05)] hover:shadow-md hover:border-primary/30"
                    : "bg-muted/30 border-border/50 opacity-80 hover:opacity-100",
                priority === 'high' && !is_read && "ring-1 ring-red-500/20 bg-red-500/[0.02]",
                isExpanded && "border-primary/30 shadow-md ring-1 ring-primary/5"
            )}
        >
            <div className={cn(
                "flex shrink-0 items-start justify-center pt-1 transition-transform duration-300 group-hover:scale-105",
            )}>
                <div className={cn(
                    "flex items-center justify-center rounded-2xl border shadow-sm",
                    compact ? "h-10 w-10 p-2" : "h-12 w-12 p-2.5",
                    !is_read ? color : "bg-muted/50 text-muted-foreground border-muted",
                    !is_read && glow
                )}>
                    <Icon className={cn("w-full h-full", priority === 'high' && !is_read && "animate-pulse")} />
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className={cn(
                        "font-bold leading-tight tracking-tight",
                        compact ? "text-xs" : "text-sm",
                        !is_read ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {title}
                        {priority === 'high' && !is_read && <span className="ml-2 text-[8px] font-black uppercase text-red-500 align-middle">CRITICAL</span>}
                    </h4>
                    {!is_read && (
                        <div className={cn(
                            "h-2 w-2 rounded-full mt-1 shrink-0",
                            priority === 'high' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary"
                        )} />
                    )}
                </div>

                <div className="space-y-2">
                    <p className={cn(
                        "leading-relaxed transition-all duration-300",
                        !isExpanded && (compact ? "text-[11px] line-clamp-2" : "text-xs line-clamp-3"),
                        isExpanded && (compact ? "text-[11px]" : "text-xs"),
                        !is_read ? "text-muted-foreground/90 font-medium" : "text-muted-foreground/70"
                    )}>
                        {message}
                    </p>
                    {message.length > 80 && (
                        <button
                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                        >
                            {isExpanded ? 'Show less' : 'Read full message'}
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground flex items-center font-bold tracking-tight bg-muted/30 px-2 py-0.5 rounded-md uppercase">
                            <Clock className="h-3 w-3 mr-1 opacity-70" />
                            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                        </span>
                        {priority === 'low' && (
                            <Badge variant="outline" className="text-[8px] h-3 px-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-black">INSIGHT</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {notification.metadata?.action_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[10px] font-black uppercase rounded-lg bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all z-20"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(notification.metadata?.action_url, '_blank')
                                }}
                            >
                                {notification.metadata?.action_label || 'View Details'}
                            </Button>
                        )}
                        {!is_read && onMarkRead && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-3 text-[10px] font-black uppercase rounded-lg active:scale-95 transition-all z-20",
                                    priority === 'high' ? "text-red-500 hover:bg-red-500/10" : "text-primary hover:bg-primary/10"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onMarkRead()
                                }}
                            >
                                Dismiss
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmptyState({ icon: Icon, title, message }: { icon: any, title: string, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
                    <Icon className="h-10 w-10 text-primary animate-bounce-subtle" />
                </div>
            </div>
            <div className="space-y-1 relative">
                <h4 className="font-black text-lg tracking-tight text-foreground">{title}</h4>
                <p className="text-sm font-medium text-muted-foreground/80 max-w-[200px] leading-relaxed">{message}</p>
            </div>
        </div>
    )
}

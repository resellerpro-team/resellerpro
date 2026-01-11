'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, X, AlertCircle, Wallet, Package as PackageIcon, MessageSquare, Info } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils/cn'
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

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.data) {
                setNotifications(data.data)
                setUnreadCount(data.data.filter((n: Notification) => !n.is_read).length)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
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
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const unreadNotifications = notifications.filter(n => !n.is_read)
    const readNotifications = notifications.filter(n => n.is_read)
    const recentReadNotifications = readNotifications.slice(0, 10)

    return (
        <>
            <Popover open={isPopoverOpen} onOpenChange={(open) => {
                setIsPopoverOpen(open)
                if (open) fetchNotifications()
            }}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0 flex flex-col shadow-xl border-primary/10 overflow-hidden" align="end">
                    <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">Quick View</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] uppercase font-bold text-primary"
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setIsPopoverOpen(false)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="unread" className="flex flex-col">
                        <div className="px-4 py-2 border-b bg-card">
                            <TabsList className="grid w-full grid-cols-2 h-8 p-0.5 bg-muted">
                                <TabsTrigger value="unread" className="text-[10px] font-bold uppercase">
                                    Action Needed
                                </TabsTrigger>
                                <TabsTrigger value="history" className="text-[10px] font-bold uppercase">
                                    Recent History
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="max-h-[400px]">
                            <TabsContent value="unread" className="m-0 p-2 space-y-1">
                                {unreadNotifications.length === 0 ? (
                                    <EmptyState message="No new actions." />
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
                            </TabsContent>
                            <TabsContent value="history" className="m-0 p-2 space-y-1">
                                {recentReadNotifications.length === 0 ? (
                                    <EmptyState message="No recent history." />
                                ) : (
                                    recentReadNotifications.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            compact
                                        />
                                    ))
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>

                    <div className="p-2 border-t bg-muted/30">
                        <Button
                            variant="ghost"
                            className="w-full h-9 text-xs font-bold text-primary hover:bg-primary/5 shadow-none"
                            onClick={() => {
                                setIsPopoverOpen(false)
                                setIsDrawerOpen(true)
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l shadow-2xl">
                    <SheetHeader className="p-4 border-b bg-card flex flex-row items-center justify-between space-y-0 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <SheetTitle className="text-xl font-bold">All Notifications</SheetTitle>
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="rounded-full">
                                    {unreadCount} New
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary"
                                    onClick={markAllAsRead}
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Mark all as read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </SheetHeader>

                    <Tabs defaultValue="action" className="flex-1 flex flex-col">
                        <div className="px-4 py-2 border-b bg-muted/30">
                            <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-background/50 backdrop-blur">
                                <TabsTrigger value="action" className="text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    Action Needed
                                </TabsTrigger>
                                <TabsTrigger value="history" className="text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    History
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="action" className="m-0 p-2 space-y-2">
                                {unreadNotifications.length === 0 ? (
                                    <EmptyState message="All caught up!" />
                                ) : (
                                    unreadNotifications.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={() => markAsRead(notification.id)}
                                        />
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="m-0 p-2 space-y-2">
                                {readNotifications.length === 0 ? (
                                    <EmptyState message="History is empty." />
                                ) : (
                                    readNotifications.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                        />
                                    ))
                                )}
                            </TabsContent>
                        </ScrollArea>
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
    const getIcon = (type: string) => {
        switch (type) {
            case 'enquiry_followup_due': return <MessageSquare className="h-4 w-4" />
            case 'wallet_credited': return <Wallet className="h-4 w-4" />
            case 'subscription_expiring_soon': return <AlertCircle className="h-4 w-4" />
            case 'low_stock': return <PackageIcon className="h-4 w-4" />
            case 'system_alert': return <Info className="h-4 w-4" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    const { priority, is_read, title, message, created_at } = notification

    return (
        <div className={cn(
            "group relative flex gap-4 rounded-xl border transition-all duration-200",
            compact ? "p-3 gap-3" : "p-4 gap-4",
            !is_read ? "bg-card border-primary/20 shadow-sm" : "bg-muted/20 border-border opacity-70",
            priority === 'high' && !is_read && "ring-1 ring-destructive/30"
        )}>
            <div className={cn(
                "flex shrink-0 items-center justify-center rounded-full border shadow-sm",
                compact ? "h-8 w-8" : "h-10 w-10",
                !is_read ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"
            )}>
                {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={cn(
                        "font-semibold truncate",
                        compact ? "text-xs" : "text-sm",
                        !is_read ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {title}
                    </h4>
                    {!is_read && (
                        <div className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            priority === 'high' ? "bg-destructive animate-pulse" : "bg-primary"
                        )} />
                    )}
                </div>
                <p className={cn(
                    "text-xs leading-relaxed mb-2",
                    compact ? "line-clamp-2" : "line-clamp-3",
                    !is_read ? "text-muted-foreground font-medium" : "text-muted-foreground/80"
                )}>
                    {message}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                    </span>
                    {!is_read && onMarkRead && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] uppercase font-bold text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                                e.stopPropagation()
                                onMarkRead()
                            }}
                        >
                            Mark as read
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 opacity-50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{message}</p>
        </div>
    )
}

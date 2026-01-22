'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Plus, Sun, Moon, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue'

export default function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isOnline } = useOfflineQueue() // ✅ Initialize hook globally

  return (
    <header className="flex flex-wrap items-center justify-between px-4 border-b">
      {/* Buttons Section (Top on mobile, Right on desktop) */}
      <div className="order-1 sm:order-2 flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-end py-2 sm:py-0">
        {/* Offline Indicator */}
        {!isOnline && (
          <Badge variant="destructive" className="items-center gap-1 hidden sm:flex">
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Offline</span>
          </Badge>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <NotificationDrawer />
      </div>

      {/* Search Section (Bottom on mobile, Left on desktop) */}
      <div className="order-2 sm:order-1 flex h-16 w-full sm:w-[50%] items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <GlobalSearch />

        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2 h-10">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/enquiries/new')}>
              New Enquiry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/orders/new')}>
              New Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/products/new')}>
              New Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/customers/new')}>
              New Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function NotificationItem({
  title,
  description,
  time,
  unread,
}: {
  title: string
  description: string
  time: string
  unread?: boolean
}) {
  return (
    <div className="flex gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-0">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {unread && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

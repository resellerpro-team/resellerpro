'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  User,
  MessageSquare,
} from 'lucide-react'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from './LogoutButton'

type NavItem = {
  name: string
  href: string
  icon: any
  badge?: string | number
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Enquiries', href: '/enquiries', icon: MessageSquare },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

type UserData = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  businessName?: string | null
  planName?: string | null
} | null

export default function Sidebar({ user }: { user: UserData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const planName = user?.planName || 'Free Plan'
  const initials = getInitials(user?.name)

  useEffect(() => {
    const bottomNav = document.querySelector('nav.fixed.bottom-0')
    if (bottomNav) {
      if (mobileMenuOpen) bottomNav.classList.add('hide-mobile-nav')
      else bottomNav.classList.remove('hide-mobile-nav')
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Menu button (top-left on mobile) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72',
          'border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50',
          'transition-transform duration-300 ease-in-out flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Logo */}
        <div className="relative flex h-16 items-center gap-2 border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">ResellerPro</span>
              <span className="text-xs text-muted-foreground">Make It Professional</span>
            </div>
          </Link>

          {/* Close (X) button – top-right inside sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute border top-4 right-4"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-custom">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'hover:bg-accent ',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : 'default'}
                    className="h-5 min-w-5 px-1 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-accent transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-left">
                  <span className="font-medium truncate max-w-[140px]">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{planName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/subscription">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  HardDrive,
  LifeBuoy,
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  Wallet,
} from 'lucide-react'

export function SidebarContent({ pathname, handleLogout }: { pathname: string; handleLogout: () => void }) {
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { href: '/ekodrix-panel', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/ekodrix-panel/analytics', label: 'Analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'User Management',
      items: [
        { href: '/ekodrix-panel/customers', label: 'Customers', icon: Users },
        { href: '/ekodrix-panel/subscriptions', label: 'Subscriptions', icon: CreditCard },
        { href: '/ekodrix-panel/wallets', label: 'Wallets', icon: Wallet },
      ],
    },
    {
      title: 'Financial',
      items: [
        { href: '/ekodrix-panel/transactions', label: 'Transactions', icon: Receipt },
        { href: '/ekodrix-panel/referrals', label: 'Referrals', icon: TrendingUp },
      ],
    },
    {
      title: 'System',
      items: [
        { href: '/ekodrix-panel/storage', label: 'Storage', icon: HardDrive },
        { href: '/ekodrix-panel/notifications', label: 'Notifications', icon: Bell },
        { href: '/ekodrix-panel/support', label: 'Support Tools', icon: LifeBuoy },
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a]">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <Image 
              src="/ekodrix-icon.png" 
              alt="Ekodrix Logo" 
              fill
              className="object-contain mix-blend-screen"
              priority
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Ekodrix Panel</h2>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500/60">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar px-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-8">
            <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/ekodrix-panel' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative group',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-full" />
                    )}
                    <Icon
                      size={18}
                      className={cn(
                        'transition-transform duration-300 group-hover:scale-110',
                        isActive ? 'text-emerald-400' : 'text-gray-500'
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-sm font-bold text-gray-500 hover:text-red-400 
                     hover:bg-red-500/10 px-4 py-3 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  )
}

export default function EkodrixSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/ekodrix-auth', { method: 'DELETE' })
    router.push('/ekodrix-panel/signin')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex w-72 h-screen border-r border-white/5 flex-col sticky top-0 shrink-0">
      <SidebarContent pathname={pathname} handleLogout={handleLogout} />
    </aside>
  )
}

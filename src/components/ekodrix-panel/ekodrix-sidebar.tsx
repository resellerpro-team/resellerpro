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

export default function EkodrixSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/ekodrix-auth', { method: 'DELETE' })
    router.push('/ekodrix-panel/signin')
    router.refresh()
  }

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
    <aside className="w-72 h-screen bg-[#0a0f1a] text-gray-200 border-r border-white/5 flex flex-col sticky top-0">
      {/* Logo / Brand - Fixed */}
      <div className="p-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 relative flex items-center justify-center">
            <Image 
              src="/ekodrix-icon.png" 
              alt="Ekodrix Logo" 
              fill
              className="object-contain mix-blend-screen"
              priority
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ekodrix Panel</h2>
            <p className="text-xs text-gray-500">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
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
                      'flex items-center gap-3 mx-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border-l-2 border-emerald-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'transition-colors',
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

      {/* Logout Button - Fixed At Bottom */}
      <div className="border-t border-white/5 p-4 shrink-0 bg-[#0a0f1a]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-sm font-medium text-gray-400 hover:text-red-400 
                     hover:bg-red-500/10 px-4 py-2.5 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

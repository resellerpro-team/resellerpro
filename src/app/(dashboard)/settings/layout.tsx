
'use client'

import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  CreditCard,
  Settings as SettingsIcon,
  Wallet,
  Gift,
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

const settingsNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Business",
    href: "/settings/business",
    icon: Building,
  },
  {
    title: "Subscription",
    href: "/settings/subscription",
    icon: CreditCard,
  },
  {
    title: "Wallet",
    href: "/settings/wallet",
    icon: Wallet,
  },
  {
    title: "Referrals",
    href: "/settings/referrals",
    icon: Gift,
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: SettingsIcon,
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="sm:text-3xl text-[25px] font-bold">Settings</h1>
        <p className="text-muted-foreground text-[15px]">
          Manage your account and business settings.
        </p>
      </div>

      <Separator />

      {/* Horizontal Tab Navigation */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav
            className="flex gap-2 border-b border-border mb-6"
            role="tablist"
            aria-label="Settings navigation"
          >
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium",
                    "border-b-2 transition-all duration-200 whitespace-nowrap",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl">
        {children}
      </div>
    </div>
  )
}

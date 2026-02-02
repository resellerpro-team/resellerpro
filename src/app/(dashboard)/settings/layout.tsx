
'use client'

import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  CreditCard,
  Settings as SettingsIcon,
  Wallet,
  Gift,
  ShieldCheck,
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from "next/navigation"
import { useRef, useState, useEffect, useCallback } from "react"
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
    title: "Security",
    href: "/settings/security",
    icon: ShieldCheck,
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

// Group tabs into pages of 3 for dot indicators
const TABS_PER_PAGE = 3
const totalPages = Math.ceil(settingsNavItems.length / TABS_PER_PAGE)

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activePage, setActivePage] = useState(0)

  // Calculate which page is currently in view based on scroll position
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth - container.clientWidth

    if (scrollWidth <= 0) {
      setActivePage(0)
      return
    }

    // Calculate page based on scroll percentage
    const scrollPercentage = scrollLeft / scrollWidth
    const page = Math.round(scrollPercentage * (totalPages - 1))
    setActivePage(Math.min(page, totalPages - 1))
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Scroll to a specific page when clicking a dot
  const scrollToPage = (pageIndex: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollWidth = container.scrollWidth - container.clientWidth
    const targetScroll = (pageIndex / (totalPages - 1)) * scrollWidth

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  return (
    <div className="-mt-4 sm:-mt-6">
      {/* Page Header */}
      <div className="mb-4 pt-4 sm:pt-6">
        <h1 className="sm:text-3xl text-[25px] font-bold">Settings</h1>
        <p className="text-muted-foreground text-[15px]">
          Manage your account and business settings.
        </p>
      </div>

      {/* Horizontal Tab Navigation - Sticky on all devices */}
      <div className="sticky top-[-16px] sm:top-[-24px] z-40 bg-background pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <nav
            className="flex gap-2 border-b border-border"
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

        {/* Scroll Indicator Dots - Only visible on mobile */}
        <div className="flex justify-center gap-1.5 mt-3 mb-4 sm:hidden">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              aria-label={`Go to tab group ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activePage === index
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl">
        {children}
      </div>
    </div>
  )
}

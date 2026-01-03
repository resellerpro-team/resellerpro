
'use client'

import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

const sidebarNavItems = [
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
    title: "Preferences",
    href: "/settings/preferences",
    icon: SettingsIcon,
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sm:text-3xl text-[25px] font-bold ">Settings</h1>
        <p className="text-muted-foreground text-[15px]">
          Manage your account and business settings.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        {/* Sidebar */}
        <aside className="-mx-2 lg:w-1/5">
          <nav
            className="
              flex overflow-x-auto sm:space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1
              scrollbar-hide rounded-md p-1 border lg:border-0 border-gray-400
            "
          >
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center rounded-md  text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-2 py-2 whitespace-nowrap",
                  pathname === item.href
                    ? "bg-gray-200 hover:bg-muted"
                    : "bg-transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  )
}

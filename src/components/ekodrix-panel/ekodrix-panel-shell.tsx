'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import EkodrixSidebar, { SidebarContent } from '@/components/ekodrix-panel/ekodrix-sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Bell, Search } from 'lucide-react'

export default function EkodrixPanelShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/ekodrix-auth', { method: 'DELETE' })
    router.push('/ekodrix-panel/signin')
    router.refresh()
  }

  // Get current page title
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || 'Dashboard'
  const pageTitle = lastSegment.replace(/-/g, ' ')

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-gray-100 font-sans selection:bg-emerald-500/30">
      {/* Desktop Sidebar (Fixed) */}
      <EkodrixSidebar />

      {/* Main Framework */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Responsive Header */}
        <header className="h-16 lg:h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle (Sheet) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-r border-white/10 bg-[#0a0f1a] w-72">
                <SidebarContent pathname={pathname} handleLogout={handleLogout} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-gray-600 font-medium text-xs uppercase tracking-widest">Admin</span>
              <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full" />
              <h2 className="text-sm md:text-base font-bold text-white capitalize tracking-tight">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Search size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
              <Bell size={18} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </Button>
            <div className="w-[1px] h-4 bg-white/10 mx-1 lg:mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[11px] font-bold text-white leading-tight">Ekodrix Admin</span>
                <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Master Control</span>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-[1px]">
                <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center text-emerald-400 font-black text-sm">
                  EK
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-[#0d1117] custom-scrollbar relative">
          {/* Visual ambience */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[150px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.02] blur-[150px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 p-1 md:p-2">
             {children}
          </div>
        </main>
      </div>
    </div>
  )
}

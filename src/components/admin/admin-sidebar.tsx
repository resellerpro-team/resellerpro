// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/utils'
// import { Home, Users, CreditCard, Settings, BarChart3, LifeBuoy } from 'lucide-react'

// export default function AdminSidebar() {
//   const pathname = usePathname()

//   const navItems = [
//     { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
//     { href: '/admin/customers', label: 'Customers', icon: Users },
//     { href: '/admin/plans', label: 'Plans', icon: CreditCard },
//     { href: '/admin/usage', label: 'Usage', icon: BarChart3 },
//     { href: '/admin/settings', label: 'Settings', icon: Settings },
//     { href: '/admin/support', label: 'Support', icon: LifeBuoy },
//   ]

//   return (
//     <aside className="w-64 min-h-screen bg-[#0f172a]/95 text-gray-200 border-r border-white/10 backdrop-blur-xl shadow-lg flex flex-col">
//       {/* ===== Logo / Brand ===== */}
//       <div className="p-6 border-b border-white/10">
//         <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-red-300 bg-clip-text text-transparent">
//           Admin Portal
//         </h2>
//       </div>

//       {/* ===== Navigation ===== */}
//       <nav className="flex-1 py-4 space-y-1">
//         {navItems.map(({ href, label, icon: Icon }) => {
//           const active = pathname === href
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={cn(
//                 'flex items-center gap-3 px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
//                 active
//                   ? 'bg-gradient-to-r from-indigo-500/20 to-blue-500/10 text-indigo-400 border-l-2 border-indigo-500'
//                   : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
//               )}
//             >
//               <Icon
//                 size={18}
//                 className={cn(
//                   'transition-colors',
//                   active ? 'text-yellow-400' : 'text-gray-400 group-hover:text-indigo-400'
//                 )}
//               />
//               <span>{label}</span>
//             </Link>
//           )
//         })}
//       </nav>

      
//     </aside>
//   )
// }

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  LifeBuoy,
  LogOut,
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/plans', label: 'Plans', icon: CreditCard },
    { href: '/admin/usage', label: 'Usage', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/support', label: 'Support', icon: LifeBuoy },
  ]

  return (
    <aside className="w-64 min-h-screen bg-[#0f172a]/95 text-gray-200 border-r border-white/10 backdrop-blur-xl shadow-lg flex flex-col">
      {/* ===== Logo / Brand ===== */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent">
          Admin Portal
        </h2>
      </div>

      {/* ===== Navigation ===== */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-indigo-500/20 to-blue-500/10 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'transition-colors',
                  active
                    ? 'text-yellow-400'
                    : 'text-gray-400 group-hover:text-indigo-400'
                )}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ===== Logout Button ===== */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/[0.05] px-5 py-2.5 rounded-md transition-all"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-400" />
          Logout
        </button>
      </div>
    </aside>
  )
}

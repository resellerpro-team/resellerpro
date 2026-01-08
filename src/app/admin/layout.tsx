import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// import AdminNav from '@/components/admin/admin-nav'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ Supabase Auth Check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // ✅ Check Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // ✅ Auth Passed → Render Admin Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-gray-100">
     

      {/* ===== Layout Body ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (collapsible) */}
        <aside className="hidden md:block w-64 border-r border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg">
          <AdminSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-10">{children}</div>
        </main>
      </div>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/10 bg-white/[0.03] backdrop-blur-sm text-center py-3 text-sm text-gray-500">
        © {new Date().getFullYear()} Resellerpro Admin — All Rights Reserved
      </footer>
    </div>
  )
}

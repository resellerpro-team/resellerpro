import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Define the type for the user data we will pass down
type UserData = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
} | null

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no user is logged in, redirect to login page immediately
  if (!user) {
    redirect('/login')
  }
  
  // Fetch the user's profile from the 'profiles' table
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Prepare the user data object to pass to client components
  const userData: UserData = {
    name: profile?.full_name,
    email: user.email,
    avatarUrl: profile?.avatar_url,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pass the fetched user data to the Sidebar component */}
      <Sidebar user={userData} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Also pass it to the Header component */}
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
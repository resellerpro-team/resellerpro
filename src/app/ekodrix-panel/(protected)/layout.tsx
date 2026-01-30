import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EkodrixSidebar from '@/components/ekodrix-panel/ekodrix-sidebar'

const SESSION_COOKIE_NAME = 'ekodrix-session'
const SESSION_SECRET = 'ekodrix-panel-secret-2026'

async function validateSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) return false

  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [dataStr, secret] = decoded.split('|')

    if (secret !== SESSION_SECRET) return false

    const data = JSON.parse(dataStr)
    if (data.exp < Date.now()) return false

    return true
  } catch {
    return false
  }
}

export default async function EkodrixPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await validateSession()

  if (!isAuthenticated) {
    redirect('/ekodrix-panel/signin')
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f1a] text-gray-100">
      {/* Sidebar */}
      <EkodrixSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import EkodrixPanelShell from '@/components/ekodrix-panel/ekodrix-panel-shell'

const SESSION_COOKIE_NAME = 'ekodrix-session'

async function validateSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) return false

  try {
    const secret = process.env.EKODRIX_SESSION_SECRET || 'dev-ekodrix-secret-change-in-production'
    const decoded = jwt.verify(sessionToken, secret) as { user: string; iat: number; exp: number }
    return !!decoded.user
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

  return <EkodrixPanelShell>{children}</EkodrixPanelShell>
}

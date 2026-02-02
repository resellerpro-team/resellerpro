'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Smartphone, Monitor, Tablet, MapPin, Clock, Loader2, LogOut, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface Session {
  id: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  location: string
  device_info: string | any
  last_active: string
  is_current: boolean
  created_at: string
}

export default function ActiveDevices() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const { toast } = useToast()

  // 1. Helpers (Hoisted or defined before use)
  const getDeviceName = useCallback((session: Session) => {
    let deviceInfo: any = null
    try {
      if (session.device_info) {
        deviceInfo = typeof session.device_info === 'string' 
          ? JSON.parse(session.device_info) 
          : session.device_info
      }
    } catch (e) {
      console.error('Failed to parse device info', e)
    }

    // 🏆 SENIOR PRIORITIZATION: Use high-accuracy hardware name first
    if (deviceInfo?.deviceName) {
      return `${deviceInfo.deviceName} (${session.browser})`
    }

    if (deviceInfo?.deviceModel) {
      const vendor = deviceInfo.deviceVendor ? `${deviceInfo.deviceVendor} ` : ''
      return `${vendor}${deviceInfo.deviceModel} (${session.browser})`
    }

    if (session.browser && session.os) {
      return `${session.browser} on ${session.os}`
    }
    return 'Unknown Device'
  }, [])

  const getHardwareHint = useCallback(async () => {
    if (typeof window === 'undefined') return null
    try {
      // 🕵️ SENIOR SECURITY: High-Entropy Probing (Instagram Standard)
      const uaData = (navigator as any).userAgentData
      if (uaData) {
        // Ask for high-accuracy details
        const entropy = await uaData.getHighEntropyValues(['model', 'platformVersion'])
        if (entropy.model && entropy.model !== '') {
          return entropy.model
        }
        
        // 🔎 Filter out known browser names to find the actual platform/hardware hint
        const browserNames = ['chrome', 'chromium', 'edge', 'safari', 'firefox', 'opera', 'brave', 'brand']
        const hardwareBrand = uaData.brands?.find((b: any) => 
          !browserNames.some(name => b.brand.toLowerCase().includes(name)) && 
          !b.brand.includes('Not')
        )?.brand
        if (hardwareBrand) return hardwareBrand

        // Fallback to platform name
        if (uaData.platform) return `${uaData.platform} PC`
      }

      // 🛡️ LEGACY FALLBACK: Standard UA Parsing with Brand Focus
      const ua = navigator.userAgent
      if (/iphone/i.test(ua)) return 'iPhone'
      if (/ipad/i.test(ua)) return 'iPad'
      if (/samsung/i.test(ua)) return 'Samsung Phone'
      
      // 🎮 GFX PROBE: Try to find GPU vendor for extra specificity
      let gpuInfo = ''
      try {
        const canvas = document.createElement('canvas')
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            if (typeof renderer === 'string') {
              if (renderer.includes('NVIDIA')) gpuInfo = ' with NVIDIA'
              else if (renderer.includes('AMD') || renderer.includes('Radeon')) gpuInfo = ' with AMD'
              else if (renderer.includes('Intel')) gpuInfo = ' with Intel Graphics'
            }
          }
        }
      } catch (e) {}

      // Desktop Brand Detection
      if (/hp |hewlett-packard/i.test(ua)) return `HP Machine${gpuInfo}`
      if (/dell/i.test(ua)) return `Dell Machine${gpuInfo}`
      if (/lenovo/i.test(ua)) return `Lenovo Machine${gpuInfo}`
      if (/asus/i.test(ua)) return `ASUS Machine${gpuInfo}`
      if (/acer/i.test(ua)) return `Acer Machine${gpuInfo}`
      if (/msi/i.test(ua)) return `MSI Machine${gpuInfo}`
      if (/macintosh/i.test(ua)) return 'Apple Mac'
      if (/windows/i.test(ua)) return `Windows PC${gpuInfo}`
    } catch (e) {
      console.warn('Hardware probing failed:', e)
    }
    return null
  }, [])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/security/sessions')
      const data = await res.json()
      if (data.success) {
        setSessions(data.sessions)

        // 🩺 SMART-SYNC: Probe hardware and update server if it's currently generic
        const currentSession = data.sessions.find((s: Session) => s.is_current)
        if (currentSession) {
          const deviceName = await getHardwareHint()
          const currentName = getDeviceName(currentSession)
          
          // 🛡️ SENIOR SYNC: Upgrade if the name is generic, unknown, or redundantly repeats the browser
          const isGeneric = currentName.includes('on') || 
                            currentName.includes('Unknown') || 
                            currentName.startsWith('Windows') ||
                            currentName.toLowerCase().includes(currentSession.browser.toLowerCase()) ||
                            currentName.toLowerCase().includes('google chrome')
          
          if (deviceName && isGeneric && deviceName !== currentSession.browser) {
            console.log('[SECURITY] Upgrading generic label to:', deviceName)
            await fetch('/api/security/track-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userAgent: navigator.userAgent,
                deviceName: deviceName 
              })
            })
            // Refresh UI
            const refreshRes = await fetch('/api/security/sessions')
            const refreshData = await refreshRes.json()
            if (refreshData.success) setSessions(refreshData.sessions)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }, [getHardwareHint, getDeviceName])

  // 2. Lifecycle
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // 3. Handlers
  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const res = await fetch(`/api/security/sessions?id=${sessionId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        toast({
          title: 'Session Revoked',
          description: 'The device has been logged out successfully.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      })
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    setRevokingAll(true)
    try {
      const currentSession = sessions.find(s => s.is_current)
      const res = await fetch('/api/security/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSessionId: currentSession?.id })
      })
      const data = await res.json()
      if (data.success) {
        setSessions(prev => prev.filter(s => s.is_current))
        toast({
          title: 'All Sessions Revoked',
          description: 'All other devices have been logged out.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive'
      })
    } finally {
      setRevokingAll(false)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-5 w-5" />
      case 'tablet': return <Tablet className="h-5 w-5" />
      default: return <Monitor className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Devices</CardTitle>
            <CardDescription>
              Devices currently logged into your account
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={revokingAll}>
                  {revokingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 mr-2" />
                  )}
                  Logout All Other Devices
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout all other devices?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log out all devices except your current one. You'll stay logged in on this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={revokeAllOtherSessions} className="bg-destructive text-destructive-foreground">
                    Logout All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No active sessions found</p>
            <p className="text-sm">Session tracking will start from your next login</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${session.is_current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {getDeviceName(session)}
                        </p>
                        {session.is_current && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            This Device
                          </Badge>
                        )}
                        {/* 🛡️ Senior Security: Flag new devices (last 24h) like Instagram does */}
                        {!session.is_current && new Date().getTime() - new Date(session.created_at).getTime() < 24 * 60 * 60 * 1000 && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {session.ip_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location || session.ip_address}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Active {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                    >
                      {revoking === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-1" />
                          Logout
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Smartphone, Monitor, Tablet, MapPin, Clock, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface LoginEntry {
  id: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  location: string
  login_success: boolean
  created_at: string
}

export default function LoginHistory() {
  const [history, setHistory] = useState<LoginEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/security/login-history')
        const data = await res.json()
        if (data.success) {
          setHistory(data.history)
        }
      } catch (error) {
        console.error('Failed to fetch login history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success 
      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />
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
        <CardTitle>Login History</CardTitle>
        <CardDescription>
          Recent login attempts to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No login history available</p>
            <p className="text-sm">Your login history will appear here after your next login</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div key={entry.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${entry.login_success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {getStatusIcon(entry.login_success)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {entry.login_success ? 'Successful login' : 'Failed login attempt'}
                        </span>
                        {!entry.login_success && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          {getDeviceIcon(entry.device_type)}
                          {entry.browser || 'Unknown'} / {entry.os || 'Unknown'}
                        </span>
                        {entry.ip_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.location || entry.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    <p>{format(new Date(entry.created_at), 'MMM dd, yyyy')}</p>
                    <p>{format(new Date(entry.created_at), 'hh:mm a')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

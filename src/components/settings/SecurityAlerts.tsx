'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Bell, Loader2, Mail, Shield, AlertTriangle, CalendarDays } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SecurityPreferences {
  email_on_new_login: boolean
  email_on_password_change: boolean
  email_on_suspicious_activity: boolean
  weekly_security_summary: boolean
  two_factor_enabled: boolean
}

export default function SecurityAlerts() {
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    email_on_new_login: true,
    email_on_password_change: true,
    email_on_suspicious_activity: true,
    weekly_security_summary: false,
    two_factor_enabled: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/security/preferences')
        const data = await res.json()
        if (data.success) {
          setPreferences(data.preferences)
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPreferences()
  }, [])

  const updatePreference = async (key: keyof SecurityPreferences, value: boolean) => {
    const prev = preferences
    setPreferences({ ...preferences, [key]: value })
    setSaving(true)

    try {
      const res = await fetch('/api/security/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      })
      const data = await res.json()
      
      if (!data.success) {
        throw new Error('Failed to update')
      }

      toast({
        title: 'Preference Updated',
        description: 'Your security alert settings have been saved.'
      })
    } catch (error) {
      setPreferences(prev) // Rollback on error
      toast({
        title: 'Error',
        description: 'Failed to save preference',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>
              Configure email notifications for security events
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Device Login */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="new-login" className="text-sm font-medium">
                New device login
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when someone logs in from a new device
              </p>
            </div>
          </div>
          <Switch
            id="new-login"
            checked={preferences.email_on_new_login}
            onCheckedChange={(checked) => updatePreference('email_on_new_login', checked)}
            disabled={saving}
          />
        </div>

        <Separator />

        {/* Password Change */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="password-change" className="text-sm font-medium">
                Password changes
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when your password is changed
              </p>
            </div>
          </div>
          <Switch
            id="password-change"
            checked={preferences.email_on_password_change}
            onCheckedChange={(checked) => updatePreference('email_on_password_change', checked)}
            disabled={saving}
          />
        </div>

        <Separator />

        {/* Suspicious Activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="suspicious" className="text-sm font-medium">
                Suspicious activity
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified about unusual account activity
              </p>
            </div>
          </div>
          <Switch
            id="suspicious"
            checked={preferences.email_on_suspicious_activity}
            onCheckedChange={(checked) => updatePreference('email_on_suspicious_activity', checked)}
            disabled={saving}
          />
        </div>

        <Separator />

        {/* Weekly Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="weekly" className="text-sm font-medium">
                Weekly security summary
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive a weekly summary of your account activity
              </p>
            </div>
          </div>
          <Switch
            id="weekly"
            checked={preferences.weekly_security_summary}
            onCheckedChange={(checked) => updatePreference('weekly_security_summary', checked)}
            disabled={saving}
          />
        </div>

        {/* Two-Factor Authentication Coming Soon */}
        <Separator />
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security to your account. Coming soon!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

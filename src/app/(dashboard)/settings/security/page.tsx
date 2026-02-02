'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Smartphone, History, Key, Bell } from 'lucide-react'
import ActiveDevices from '@/components/settings/ActiveDevices'
import LoginHistory from '@/components/settings/LoginHistory'
import PasswordChange from '@/components/settings/PasswordChange'
import SecurityAlerts from '@/components/settings/SecurityAlerts'

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security</h2>
          <p className="text-muted-foreground">
            Manage your account security and active sessions
          </p>
        </div>
      </div>

      {/* Security Overview Card */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">Your account is protected</p>
              <p className="text-sm text-muted-foreground">
                Last security check: Just now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Security Sections */}
      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4 hidden sm:block" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4 hidden sm:block" />
            History
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Key className="h-4 w-4 hidden sm:block" />
            Password
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <ActiveDevices />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <LoginHistory />
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <PasswordChange />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SecurityAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}

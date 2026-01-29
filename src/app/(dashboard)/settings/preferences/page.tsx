'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Mail, Bell, ShieldCheck, TrendingUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize the app's appearance and behavior.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Appearance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sun className="h-4 w-4 text-primary dark:hidden" />
              <Moon className="h-4 w-4 text-primary hidden dark:block" />
            </div>
            <div>
              <Label className="text-base font-bold">Appearance</Label>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((t) => (
              <Button
                key={t.id}
                variant={theme === t.id ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 rounded-xl transition-all ${theme === t.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-primary/5'
                  }`}
                onClick={() => setTheme(t.id)}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-xs font-bold">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label className="text-base font-bold">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Get updates delivered to your inbox</p>
            </div>
          </div>

          <div className="grid gap-3">
            {/* Setting Row 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 gap-4 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-background rounded-md shadow-sm border border-border/10">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-bold opacity-60">New order notifications</Label>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-600 border-0 py-0 h-4">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Instantly know when a new sale happens</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 px-2 sm:px-0">
                <span className="text-[10px] font-bold text-muted-foreground sm:hidden uppercase tracking-widest">Status</span>
                <Switch id="email-new-order" disabled className="scale-90" />
              </div>
            </div>

            {/* Setting Row 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 gap-4 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-background rounded-md shadow-sm border border-border/10">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-bold opacity-60">Weekly summary reports</Label>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-600 border-0 py-0 h-4">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Weekly analytics delivered every Monday</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 px-2 sm:px-0">
                <span className="text-[10px] font-bold text-muted-foreground sm:hidden uppercase tracking-widest">Status</span>
                <Switch id="email-summary" disabled className="scale-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button className="w-full sm:w-auto px-10 rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
            Save Preferences
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto rounded-xl font-bold h-12 text-muted-foreground">
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
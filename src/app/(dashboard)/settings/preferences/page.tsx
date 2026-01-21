'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from 'next-themes'

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
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label>Appearance</Label>
          <Select onValueChange={setTheme} defaultValue={theme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Email Notifications</Label>
          <div className="flex items-center space-x-2">
            <Switch id="email-new-order" disabled />
            <Label htmlFor="email-new-order" className="text-muted-foreground">New order notifications</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-help inline-flex">
                    <Badge variant="outline" className="text-xs font-normal bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900 dark:text-yellow-500">
                      Coming Soon
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>We're working on this feature! You'll be notified when it's ready.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="email-summary" disabled />
            <Label htmlFor="email-summary" className="text-muted-foreground">Weekly summary reports</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-help inline-flex">
                    <Badge variant="outline" className="text-xs font-normal bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900 dark:text-yellow-500">
                      Coming Soon
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>We're working on this feature! You'll be notified when it's ready.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}
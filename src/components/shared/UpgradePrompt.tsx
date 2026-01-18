'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, TrendingUp, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
}

export function UpgradePrompt({ open, onOpenChange, feature = 'this feature' }: UpgradePromptProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push('/settings/subscription')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-4 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Unlock Premium Features
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Upgrade to access {feature} and supercharge your business!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">Advanced Exports</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">Export detailed reports in PDF & CSV formats</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Advanced Analytics</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">Deep insights with custom date ranges</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Unlimited Orders</h4>
              <p className="text-xs text-purple-700 dark:text-purple-300">No limits on orders and inventory</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-500 hover:via-orange-600 hover:to-amber-700 text-white shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all border border-amber-200/20"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

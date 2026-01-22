'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Sparkles } from 'lucide-react'
import { ProBadge } from '@/components/shared/ProBadge'
import { useRouter } from 'next/navigation'

interface LockedChartProps {
  title: string
  description: string
  icon?: any
  previewContent?: React.ReactNode
  chartType?: 'pie' | 'donut' | 'bar'
}

export function LockedChart({ title, description, icon: Icon, previewContent, chartType = 'pie' }: LockedChartProps) {
  const router = useRouter()
  
  // Direct redirect - no modal, higher conversion
  const handleUpgrade = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    router.push('/settings/subscription#pricing')
  }

  // Fake realistic pie/donut chart preview
  const FakePieChart = () => (
    <div className="h-full w-full flex items-center justify-center">
      <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
        {/* Donut chart segments */}
        <circle cx="140" cy="140" r="100" fill="none" stroke="#10b981" strokeWidth="60" strokeDasharray="188 440" />
        <circle cx="140" cy="140" r="100" fill="none" stroke="#3b82f6" strokeWidth="60" strokeDasharray="125 440" strokeDashoffset="-188" />
        <circle cx="140" cy="140" r="100" fill="none" stroke="#f59e0b" strokeWidth="60" strokeDasharray="94 440" strokeDashoffset="-313" />
        <circle cx="140" cy="140" r="100" fill="none" stroke="#ef4444" strokeWidth="60" strokeDasharray="33 440" strokeDashoffset="-407" />
      </svg>
      {/* Legend */}
      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-muted-foreground">Paid (45%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-muted-foreground">Pending (30%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-muted-foreground">Processing (20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-muted-foreground">Failed (5%)</span>
        </div>
      </div>
    </div>
  )

  const FakeBarChart = () => (
    <div className="h-full w-full p-4 md:p-8">
      <div className="h-full w-full grid grid-cols-4 gap-4 items-end">
        {/* Delivered - 75% */}
        <div className="flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t shadow-lg" style={{ height: '200px' }} />
          <span className="text-xs text-muted-foreground font-medium">Delivered</span>
        </div>
        
        {/* Processing - 55% */}
        <div className="flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t shadow-lg" style={{ height: '150px' }} />
          <span className="text-xs text-muted-foreground font-medium">Processing</span>
        </div>
        
        {/* Shipped - 40% */}
        <div className="flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '110px' }} />
          <span className="text-xs text-muted-foreground font-medium">Shipped</span>
        </div>
        
        {/* Pending - 30% */}
        <div className="flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t shadow-lg" style={{ height: '80px' }} />
          <span className="text-xs text-muted-foreground font-medium">Pending</span>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group" onClick={handleUpgrade}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
              <ProBadge />
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-2 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
            <Lock className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      
      {/* Chart Layer - Fake chart with blur */}
      <CardContent className="h-[350px] relative">
        <div className="absolute inset-0" style={{ filter: 'blur(6px)' }}>
          {chartType === 'pie' || chartType === 'donut' ? <FakePieChart /> : <FakeBarChart />}
        </div>
      </CardContent>

      {/* Overlay Layer */}
      <div className="absolute inset-0 top-[72px] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 pointer-events-auto">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full blur-lg opacity-40 animate-pulse" />
          <div className="relative bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-3 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Unlock advanced analytics to track {title.toLowerCase()} and make data-driven decisions
        </p>
        
        <Button 
          className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-500 hover:via-orange-600 hover:to-amber-700 text-white shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all border border-amber-200/20"
          onClick={handleUpgrade}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </Button>
        
        <p className="text-xs text-muted-foreground mt-3">
          Click anywhere to see pricing
        </p>
      </div>
    </Card>
  )
}

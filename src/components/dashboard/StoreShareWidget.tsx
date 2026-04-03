'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, MessageCircle, Globe, Clock, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface StoreShareWidgetProps {
  shopSlug: string
  storeStatus?: string
}

export function StoreShareWidget({ shopSlug, storeStatus = 'open' }: StoreShareWidgetProps) {
  const { toast } = useToast()
  const shopUrl = `resellerpro.in/${shopSlug}`
  const fullUrl = `https://${shopUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    toast({ title: 'Link Copied ✨', description: 'Store link copied to clipboard!' })
  }

  const handleShare = () => {
    window.open(`https://wa.me/?text=Check%20out%20my%20store:%20${fullUrl}`, '_blank')
  }

  return (
    <Card className={cn("p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border shadow-sm mb-6",
      storeStatus === 'open' ? 'border-emerald-200 bg-emerald-50/50' :
      storeStatus === 'vacation' ? 'border-amber-200 bg-amber-50/50' : 'border-red-200 bg-red-50/50'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl shadow-sm border",
          storeStatus === 'open' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' :
          storeStatus === 'vacation' ? 'bg-amber-100 border-amber-200 text-amber-600' :
          'bg-red-100 border-red-200 text-red-600'
        )}>
          {storeStatus === 'open' ? <Globe className="w-6 h-6" /> :
           storeStatus === 'vacation' ? <Clock className="w-6 h-6" /> :
           <Lock className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-sm md:text-base font-bold text-slate-800">
            {storeStatus === 'open' ? '🟢 Your Store is LIVE' : storeStatus === 'vacation' ? '🟡 Store on Vacation' : '🔴 Store Closed'}
          </p>
          <div className="flex items-center text-xs text-slate-500 font-mono mt-0.5 select-all">
            {shopUrl}
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-auto items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 md:flex-none gap-1.5 h-9 bg-white hover:bg-slate-50 shadow-sm border-slate-200 text-slate-700">
          <Copy className="w-3.5 h-3.5" /> Copy Link
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 md:flex-none gap-1.5 h-9 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200 bg-white shadow-sm">
          <MessageCircle className="w-3.5 h-3.5" /> Share
        </Button>
        <Button size="sm" onClick={() => window.open(`/${shopSlug}`, '_blank')} className="gap-1 flex-shrink-0 h-9 px-3 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
          Visit <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  )
}

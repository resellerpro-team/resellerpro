'use client'

import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'

export function ProBadge() {
  return (
    <Badge 
      variant="secondary" 
      className="ml-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white border border-amber-200/20 font-bold tracking-wide shadow-[0_2px_8px_rgba(245,158,11,0.25)] px-2 py-0.5 text-[10px]"
    >
      <Crown className="h-3 w-3 mr-1 fill-current" />
      PRO
    </Badge>
  )
}

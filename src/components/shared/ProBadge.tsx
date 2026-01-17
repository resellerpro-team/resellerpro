'use client'

import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'

export function ProBadge() {
  return (
    <Badge 
      variant="secondary" 
      className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold"
    >
      <Crown className="h-3 w-3 mr-1" />
      PRO
    </Badge>
  )
}

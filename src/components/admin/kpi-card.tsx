'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  gradient?: string
  className?: string
  onClick?: () => void
  delay?: number
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  gradient = 'from-blue-500 to-indigo-600',
  className,
  onClick,
  delay = 0,
}: KpiCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        onClick={onClick}
        className={cn(
          'border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden',
          'transition-all duration-300 group relative shadow-2xl shadow-black/20',
          onClick && 'cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.04]',
          className
        )}
      >
        {/* Gradient glow */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.04] blur-3xl group-hover:opacity-[0.08] transition-opacity`} />

        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em]">
                {title}
              </p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
              </p>
              {(subtitle || trendValue) && (
                <div className="flex items-center gap-2">
                  {trendValue && (
                    <div className={cn(
                      'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
                      trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
                      trend === 'down' && 'bg-red-500/10 text-red-400',
                      trend === 'neutral' && 'bg-blue-500/10 text-blue-400',
                    )}>
                      <TrendIcon className="w-3 h-3" />
                      {trendValue}
                    </div>
                  )}
                  {subtitle && (
                    <span className="text-xs text-gray-500">{subtitle}</span>
                  )}
                </div>
              )}
            </div>
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

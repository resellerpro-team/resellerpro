'use client'

import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { SubscriptionMenu } from './SubscriptionMenu'

interface ActivePlanCardProps {
    planName: string
    status: string
    currentPeriodEnd: string
    isBusiness: boolean
    description?: string
    children?: React.ReactNode
}

export function ActivePlanCard({
    planName,
    status,
    currentPeriodEnd,
    isBusiness,
    description,
    children
}: ActivePlanCardProps) {
    // Format date
    const formattedDate = new Date(currentPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50/50 p-6 dark:border-green-800 dark:bg-green-950/20">
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                                <Check className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                Active Subscription
                            </p>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-green-900 dark:text-green-100">
                            🎉 You’re on the {planName}
                        </h3>
                    </div>

                    <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                        <p>{description || 'Premium features enabled'}</p>
                        <p className="opacity-80">Active until {formattedDate}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <Badge
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                        {status}
                    </Badge>
                    <SubscriptionMenu currentPeriodEnd={currentPeriodEnd} />
                </div>
            </div>

            {children && (
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    {children}
                </div>
            )}


            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-green-200/20 blur-3xl dark:bg-green-500/10" />
        </div>
    )
}

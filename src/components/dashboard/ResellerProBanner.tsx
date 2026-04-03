import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface ResellerProBannerProps {
    className?: string
    title?: string
    description?: string
    variant?: 'purple' | 'blue' | 'orange'
}

export function ResellerProBanner({
    className,
    title = "ResellerPro Premium",
    description = "Unlock advanced analytics, unlimited orders, and priority support.",
    variant = 'purple'
}: ResellerProBannerProps) {

    const gradients = {
        purple: "from-indigo-600 via-purple-600 to-pink-600",
        blue: "from-blue-600 via-indigo-600 to-cyan-600",
        orange: "from-orange-500 via-amber-500 to-yellow-500"
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white shadow-md group",
            gradients[variant],
            className
        )}>
            {/* Background decorations */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-blue-500/20 blur-xl" />

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight text-white">{title}</h3>
                </div>

                <p className="text-xs leading-relaxed text-white/90 font-medium line-clamp-2">
                    {description}
                </p>

                <Button
                    size="sm"
                    variant="secondary"
                    className="mt-1 w-full h-8 text-xs border-0 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white hover:shadow-lg"
                    asChild
                >
                    <Link href="/settings/subscription">
                        Upgrade Plan
                    </Link>
                </Button>
            </div>
        </div>
    )
}

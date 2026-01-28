'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'

interface LimitReachedModalProps {
    isOpen: boolean
    onClose: () => void
    feature: string
    limit: number
    planName: string
    upgradePath?: string
}

export function LimitReachedModal({
    isOpen,
    onClose,
    feature,
    limit,
    planName,
    upgradePath = '/settings/subscription'
}: LimitReachedModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-center text-xl">Limit Reached</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        You've used all <span className="font-semibold text-foreground">{limit} {feature.toLowerCase()}</span> available on your <span className="font-semibold text-foreground capitalize">{planName}</span> plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold flex items-center gap-2">
                            <span className="text-primary">✨</span> Upgrade to unlock:
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Higher {feature.toLowerCase()} limits</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Priority support</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Advanced features</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:to-primary" size="lg">
                        <Link href={upgradePath}>
                            Upgrade Plan Now
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

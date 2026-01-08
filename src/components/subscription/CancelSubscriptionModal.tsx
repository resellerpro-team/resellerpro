'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cancelSubscription } from '@/app/(dashboard)/settings/subscription/actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface CancelSubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    currentPeriodEnd: string
}

export function CancelSubscriptionModal({
    isOpen,
    onClose,
    currentPeriodEnd,
}: CancelSubscriptionModalProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleCancel = async () => {
        setLoading(true)
        try {
            const result = await cancelSubscription()
            if (result.success) {
                toast({
                    title: 'Subscription Cancelled',
                    description: 'Your subscription will end at the end of the current billing period.',
                })
                onClose()
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Failed to cancel subscription',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Format date for display
    const formattedDate = new Date(currentPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel your Professional plan?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-sm">
                        <h4 className="font-semibold mb-2">What happens next:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                                You keep access until <span className="font-medium text-foreground">{formattedDate}</span>
                            </li>
                            <li>After that, you'll be moved to the Free plan</li>
                            <li>Your order limit will be reset to 50/month</li>
                            <li>Premium features will be disabled</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
                    <Button
                        variant="default"
                        onClick={onClose}
                        className="w-full sm:w-auto order-1 sm:order-2"
                    >
                        Keep my plan
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1 text-muted-foreground hover:text-destructive"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Cancel anyway'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

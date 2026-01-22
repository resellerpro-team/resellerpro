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
import { Rocket, Star } from 'lucide-react'

interface ComingSoonDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    planName: string
}

export function ComingSoonDialog({ open, onOpenChange, planName }: ComingSoonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader className="flex flex-col items-center gap-4 pt-4">
                    <div className="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
                        <Rocket className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl">Coming Soon!</DialogTitle>
                    <DialogDescription className="text-center text-balance">
                        The <span className="font-semibold text-foreground">{planName}</span> plan is currently under development.
                        We're working hard to bring you exclusive features to supercharge your business.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>Priority Support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>Bulk Tools</span>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto min-w-[140px]">
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

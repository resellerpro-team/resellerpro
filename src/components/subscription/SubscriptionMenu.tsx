'use client'

import { useState } from 'react'
import { MoreHorizontal, CreditCard, FileText, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CancelSubscriptionModal } from './CancelSubscriptionModal'

interface SubscriptionMenuProps {
    currentPeriodEnd: string
}

export function SubscriptionMenu({ currentPeriodEnd }: SubscriptionMenuProps) {
    const [showCancelModal, setShowCancelModal] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Manage billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View invoices</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => setShowCancelModal(true)}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Cancel subscription</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                currentPeriodEnd={currentPeriodEnd}
            />
        </>
    )
}

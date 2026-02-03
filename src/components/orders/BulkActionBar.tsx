'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, X, Loader2, Truck } from 'lucide-react'
import { bulkUpdateOrderStatus } from '@/app/(dashboard)/orders/actions'
import { STATUS_FLOW, STATUS_CONFIG } from '@/config/order-status'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface BulkActionBarProps {
    selectedIds: string[]
    currentStatus?: string
    onClearSelection: () => void
    onSuccess?: () => void
}

export function BulkActionBar({
    selectedIds,
    currentStatus,
    onClearSelection,
    onSuccess
}: BulkActionBarProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()
    const queryClient = useQueryClient()

    if (selectedIds.length === 0) return null

    // Filter allowed options based on the current status of selected orders
    // CRITICAL: Filter out 'shipped' from bulk updates as it requires tracking IDs
    const normalizedStatus = currentStatus?.toLowerCase()
    const allowedNextStatuses = normalizedStatus
        ? (STATUS_FLOW[normalizedStatus] || []).filter(status => status !== 'shipped')
        : []
    const availableOptions = allowedNextStatuses.map(status => ({
        value: status,
        ...STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    }))

    const handleBulkUpdate = async () => {
        if (!selectedStatus) {
            toast({
                title: 'Selection required',
                description: 'Please select a status to apply to all selected orders.',
                variant: 'destructive',
            })
            return
        }

        startTransition(async () => {
            const result = await bulkUpdateOrderStatus(selectedIds, selectedStatus)
            if (result.success) {
                toast({
                    title: 'Success',
                    description: result.message,
                })

                // Invalidate React Query cache to update UI instantly
                queryClient.invalidateQueries({ queryKey: ['orders'] })
                queryClient.invalidateQueries({ queryKey: ['orders-stats'] })

                onClearSelection()
                onSuccess?.()
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                })
            }
        })
    }

    return (
        <div className="fixed bottom-16 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[60] w-full sm:w-[calc(100%-2rem)] sm:max-w-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-500 ease-out">
            <div className="bg-background/95 backdrop-blur-md border-t sm:border-2 border-primary/20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] sm:rounded-2xl p-4 pb-8 sm:pb-4 flex flex-col sm:flex-row items-center gap-4">
                {/* Mobile Handle */}
                <div className="w-12 h-1.5 bg-muted rounded-full mb-2 sm:hidden self-center opacity-50" />

                {/* Selection Info */}
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto px-1 sm:px-0">
                    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-black">
                                {selectedIds.length} {selectedIds.length === 1 ? 'order' : 'orders'} selected
                            </p>
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-bold uppercase  bg-primary/10 text-primary border-0">
                                {currentStatus}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">Ready for batch operation</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 -mr-2 sm:hidden rounded-full hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                        onClick={onClearSelection}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>


                {/* Action Controls */}
                <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                    {availableOptions.length > 0 ? (
                        <>
                            <div className="flex-1 sm:w-[190px]">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="h-10 sm:h-10 w-full bg-muted/50 border-0 rounded-xl font-medium focus:ring-2 ring-primary/20">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent
                                        side="top"
                                        sideOffset={12}
                                        className="rounded-xl border-primary/10 z-[70] p-1"
                                    >
                                        {normalizedStatus === 'processing' && (
                                            <div className="px-2 pt-1 pb-2 mb-1 border-b border-amber-500/10">
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 text-amber-600">
                                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                                    <p className="text-[10px] font-bold leading-tight">
                                                        Status 'Shipped' is not available for bulk action.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {availableOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="rounded-lg my-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${opt.color}`} />
                                                    <span className="font-semibold text-sm">{opt.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleBulkUpdate}
                                disabled={isPending || !selectedStatus}
                                className="h-10 flex-1 sm:w-auto sm:px-8 font-black rounded-xl shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-primary/40 active:scale-[0.97] transition-all"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Truck className="h-4 w-4 mr-2" />
                                        Update
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-xl border border-border/50 w-full justify-center">
                            <X className="h-4 w-4" />
                            Final Status - No Transitions
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden sm:flex h-10 w-10 shrink-0 rounded-xl border-muted-foreground/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                        onClick={onClearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

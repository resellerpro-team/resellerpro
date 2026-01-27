'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { RequireVerification } from '../shared/RequireVerification'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal'
import { useRouter } from 'next/navigation'

export function QuickActions() {
    const router = useRouter()
    const { checkLimit, limitModalProps, isLoading } = usePlanLimits()

    const handleAction = (path: string, feature: 'orders' | 'enquiries' | 'products' | 'customers') => {
        if (checkLimit(feature)) {
            router.push(path)
        }
    }

    return (
        <>
            <Card className="flex flex-col h-[500px] shadow-lg border-2">
                <CardHeader className="pb-3">
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription className="text-xs">Common tasks at your fingertips</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="grid gap-2">
                            <RequireVerification>
                                <Button
                                    className="w-full justify-start"
                                    onClick={() => handleAction('/enquiries/new', 'enquiries')}
                                    disabled={isLoading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Enquiry
                                </Button>
                            </RequireVerification>
                            <RequireVerification>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleAction('/orders/new', 'orders')}
                                    disabled={isLoading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Order
                                </Button>
                            </RequireVerification>
                            <RequireVerification>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleAction('/products/new', 'products')}
                                    disabled={isLoading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Product
                                </Button>
                            </RequireVerification>
                            <RequireVerification>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleAction('/customers/new', 'customers')}
                                    disabled={isLoading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Customer
                                </Button>
                            </RequireVerification>
                        </div>
                    </ScrollArea>

                    <div className="mt-4 pt-4 border-t">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                            <Link href="/analytics">
                                View Analytics
                                <ArrowRight className="ml-auto h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <LimitReachedModal {...limitModalProps} />
        </>
    )
}


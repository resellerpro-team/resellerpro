'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { RequireVerification } from '../shared/RequireVerification'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast";
import { ResellerProBanner } from './ResellerProBanner'

export function QuickActions() {
    const router = useRouter()
    const { toast } = useToast()
    const {
        canCreateOrder,
        canCreateEnquiry,
        canCreateProduct,
        canCreateCustomer,
        subscription,
        isLoading
    } = usePlanLimits()

    const planName = subscription?.plan?.display_name || 'Free Plan'

    const handleAction = (path: string, allowed: boolean, featureName: string) => {
        if (allowed) {
            router.push(path)
        } else {
            toast({
                title: "Limit Reached 🔒",
                description: `You've reached your ${featureName} limit on the ${planName}. Upgrade to unlock more!`,
                variant: "default",
                action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
            })
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
                                    onClick={() => handleAction('/enquiries/new', canCreateEnquiry, 'enquiry')}
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
                                    onClick={() => handleAction('/orders/new', canCreateOrder, 'order')}
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
                                    onClick={() => handleAction('/products/new', canCreateProduct, 'product')}
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
                                    onClick={() => handleAction('/customers/new', canCreateCustomer, 'customer')}
                                    disabled={isLoading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Customer
                                </Button>
                            </RequireVerification>
                        </div>
                    </ScrollArea>
                    <ResellerProBanner
                        className="mt-4"
                        title="Unlock Unlimited Actions"
                        description="Create unlimited orders, products, and customers with Premium."
                        variant="blue"
                    />

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
        </>
    )
}


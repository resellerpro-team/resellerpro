import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ResellerProBanner } from './ResellerProBanner'

interface AlertsWidgetProps {
    alerts: {
        pendingOrders: number
        lowStockProducts: number
        monthlyRevenue: number
        monthlyTarget: number
        totalOrders: number
    }
}

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
    const pendingOrdersMessage = `${alerts.pendingOrders} order${alerts.pendingOrders > 1 ? 's' : ''} pending - need your attention`
    const lowStockMessage = `${alerts.lowStockProducts} product${alerts.lowStockProducts > 1 ? 's' : ''} running low on stock`

    return (
        <Card className="flex flex-col h-[500px] shadow-lg border-2">
            <CardHeader className="pb-3">
                <CardTitle>Alerts & Notifications</CardTitle>
                <CardDescription className="text-xs">Important updates for your business</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-3">
                        {alerts.pendingOrders > 0 && (
                            <AlertItem
                                type="warning"
                                message={pendingOrdersMessage}
                                action="View Orders"
                                href="/orders?status=pending"
                            />
                        )}
                        {alerts.lowStockProducts > 0 && (
                            <AlertItem
                                type="info"
                                message={lowStockMessage}
                                action="Manage Stock"
                                href="/products"
                            />
                        )}
                        {(() => {
                            const now = new Date()
                            const daysElapsed = now.getDate()
                            const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                            const forecastRevenue = (alerts.monthlyRevenue / daysElapsed) * totalDaysInMonth
                            const isOnTrack = forecastRevenue >= alerts.monthlyTarget

                            const milestones = [10000, 25000, 50000, 75000, 100000, 250000, 500000, 1000000]
                            const lastMilestone = [...milestones].reverse().find(m => m <= alerts.monthlyRevenue)

                            if (alerts.totalOrders === 0) {
                                return (
                                    <AlertItem
                                        type="info"
                                        message="Your revenue insights will appear once you start receiving orders."
                                        action="View Analytics"
                                        href="/analytics"
                                    />
                                )
                            }

                            const isJustHit = lastMilestone && (alerts.monthlyRevenue <= lastMilestone * 1.05)

                            if (isJustHit) {
                                return (
                                    <AlertItem
                                        type="success"
                                        message={`Congratulations! You've crossed the ₹${lastMilestone.toLocaleString('en-IN')} milestone!`}
                                        action="View Analytics"
                                        href="/analytics"
                                    />
                                )
                            }

                            if (isOnTrack && alerts.monthlyRevenue > 0) {
                                return (
                                    <AlertItem
                                        type="success"
                                        message={`At this pace, you may cross ₹${alerts.monthlyTarget.toLocaleString('en-IN')} this month.`}
                                        action="View Analytics"
                                        href="/analytics"
                                    />
                                )
                            }

                            return (
                                <AlertItem
                                    type="info"
                                    message={`You've earned ₹${alerts.monthlyRevenue.toLocaleString('en-IN')} so far this month.`}
                                    action="View Analytics"
                                    href="/analytics"
                                />
                            )
                        })()}
                    </div>
                </ScrollArea>
                <ResellerProBanner
                    className="mt-4"
                    title="Advanced Business Insights"
                    description="Get detailed revenue analysis, growth forecasts, and AI recommendations."
                    variant="purple"
                />

                <div className="mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                        <Link href="/orders">
                            View All Orders
                            <ArrowRight className="ml-auto h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function AlertItem({
    type,
    message,
    action,
    href,
}: {
    type: 'warning' | 'info' | 'success'
    message: string
    action: string
    href: string
}) {
    const config = {
        warning: { icon: AlertCircle, color: 'text-yellow-500' },
        info: { icon: AlertCircle, color: 'text-blue-500' },
        success: { icon: CheckCircle2, color: 'text-green-500' },
    }

    const Icon = config[type].icon

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config[type].color}`} />
            <div className="flex-1">
                <p className="text-sm">{message}</p>
                <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild>
                    <Link href={href}>{action}</Link>
                </Button>
            </div>
        </div>
    )
}

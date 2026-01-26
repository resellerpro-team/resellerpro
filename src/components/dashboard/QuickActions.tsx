import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
    return (
        <Card className="flex flex-col h-[500px] shadow-lg border-2">
            <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-xs">Common tasks at your fingertips</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="grid gap-2">
                        <Button className="justify-start" asChild>
                            <Link href="/enquiries/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Enquiry
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/orders/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Order
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/products/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Product
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link href="/customers/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Customer
                            </Link>
                        </Button>
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
    )
}

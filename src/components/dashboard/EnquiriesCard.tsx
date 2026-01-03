'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { MessageSquare, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Enquiry } from '@/app/(dashboard)/dashboard/action'

interface EnquiriesCardProps {
    enquiries: Enquiry[]
}

export function EnquiriesCard({ enquiries }: EnquiriesCardProps) {
    // Show only first 2 enquiries in the main card
    const visibleEnquiries = enquiries.slice(0, 2)

    return (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-500" />
                        Enquiries
                    </CardTitle>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            All Enquiries
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="flex items-center gap-2 text-2xl">
                                <MessageSquare className="h-6 w-6 text-indigo-500" />
                                Customer Enquiries
                            </SheetTitle>
                            <SheetDescription>
                                View and manage all your customer enquiries here.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4">
                            {enquiries.map((enquiry) => (
                                <EnquiryItem key={enquiry.id} enquiry={enquiry} detailed />
                            ))}
                            {enquiries.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No enquiries yet.
                                </p>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {visibleEnquiries.length > 0 ? (
                        visibleEnquiries.map((enquiry) => (
                            <EnquiryItem key={enquiry.id} enquiry={enquiry} />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No enquiries yet</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function EnquiryItem({
    enquiry,
    detailed = false,
}: {
    enquiry: Enquiry
    detailed?: boolean
}) {
    const statusColors = {
        new: 'bg-indigo-500',
        read: 'bg-gray-500',
        replied: 'bg-green-500',
    }

    return (
        <div
            className={`p-3 rounded-lg border bg-card text-card-foreground shadow-sm ${detailed ? 'p-4' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{enquiry.customerName}</span>
                        {enquiry.status === 'new' && (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 text-[10px] h-5 px-1.5">
                                New
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {enquiry.message}
                    </p>
                    {detailed && (
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">Reply</Button>
                            <Button size="sm" variant="ghost">Mark Read</Button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {enquiry.date}
                    </div>
                </div>
            </div>
        </div>
    )
}

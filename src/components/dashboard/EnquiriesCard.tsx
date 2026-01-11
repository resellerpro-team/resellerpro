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
import { MessageSquare, ArrowRight, Clock, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Enquiry } from '@/app/(dashboard)/dashboard/action'
import Image from 'next/image'
import Link from 'next/link'

interface EnquiriesCardProps {
    enquiries: Enquiry[]
}

export function EnquiriesCard({ enquiries }: EnquiriesCardProps) {
    // Show only first 2 enquiries in the main card
    const visibleEnquiries = enquiries.slice(0, 2)
    const hasEnquiries = enquiries.length > 0
    const hasNewEnquiries = enquiries.some(enquiry => enquiry.status === 'new')

    return (
        <Card className="overflow-hidden border-indigo-500/20 bg-white dark:bg-slate-950">
            <div className="flex flex-col md:flex-row min-h-[350px]">
                <div className="flex-1 border-r border-indigo-100 dark:border-indigo-900/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Enquiries
                                </CardTitle>
                                <CardDescription>
                                    {enquiries.length > 0
                                        ? `${enquiries.length} enquiries waiting for follow-up`
                                        : 'No new enquiries waiting for follow-up'}
                                </CardDescription>
                            </div>
                            {hasNewEnquiries && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                    asChild
                                >
                                    <Link href="/enquiries/new">
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Add new enquiry</span>
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {hasNewEnquiries ? (
                                <Sheet>
                                    <div className="space-y-4">
                                        {visibleEnquiries.map((enquiry) => (
                                            <EnquiryItem key={enquiry.id} enquiry={enquiry} />
                                        ))}
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between mt-2 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                            >
                                                View all enquiries
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </SheetTrigger>
                                    </div>
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
                            ) : (
                                <div className="flex flex-col items-start justify-center h-full py-2 space-y-4">
                                    <div className="space-y-2">
                                        <p className="font-medium text-base">
                                            {hasEnquiries
                                                ? "All enquiries are up to date 🐌✨"
                                                : "No enquiries yet"}
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {hasEnquiries
                                                ? "You've followed up with all recent customers."
                                                : "New enquiries will appear here when customers contact you."}
                                        </p>
                                    </div>
                                    <Button className="bg-blue-500 hover:bg-blue-600 gap-2" asChild>
                                        <Link href="/enquiries/new">
                                            <Plus className="h-4 w-4" />
                                            Add new enquiry
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>

                {/* Illustration Side */}
                {/* Illustration Side */}
                <div className="w-full md:w-1/2 relative min-h-[200px] md:min-h-full bg-indigo-50/50 dark:bg-indigo-950/20">
                    <Image
                        src="/enquiry-illustration.png"
                        alt="Enquiries Illustration"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div >
        </Card >
    )
}

function EnquiryItem({
    enquiry,
    detailed = false,
}: {
    enquiry: Enquiry
    detailed?: boolean
}) {
    return (
        <div
            className={`p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent/50 ${detailed ? 'p-4' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{enquiry.customerName}</span>
                        {enquiry.status === 'new' && (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 text-[10px] h-5 px-1.5 border-0">
                                New
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {enquiry.message}
                    </p>
                    {detailed && (
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="h-8">Reply</Button>
                            <Button size="sm" variant="ghost" className="h-8">Mark Read</Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {enquiry.date}
            </div>
        </div>
    )
}

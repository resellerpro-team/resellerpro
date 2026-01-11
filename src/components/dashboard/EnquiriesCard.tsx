'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    MessageSquare,
    ArrowRight,
    Clock,
    Plus,
    Inbox,
    CheckCircle2,
    Sparkles,
    ShoppingBag
} from 'lucide-react'
import type { Enquiry } from '@/app/(dashboard)/dashboard/action'
import Link from 'next/link'

interface EnquiriesCardProps {
    enquiries: Enquiry[]
}

export function EnquiriesCard({ enquiries }: EnquiriesCardProps) {
    // Treat 'converted' and 'dropped' as closed/handled
    const activeEnquiries = enquiries.filter(e => e.status !== 'converted' && e.status !== 'dropped')
    const hasAnyEnquiries = enquiries.length > 0
    const hasActiveEnquiries = activeEnquiries.length > 0

    // Scenario 1: Empty State (New User / No data)
    if (!hasAnyEnquiries) {
        return (
            <Card className="relative overflow-hidden border-indigo-500/10 bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl shadow-blue-500/20" />

                <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center relative z-10">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                        <Inbox size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No enquiries yet? Let's start receiving them.</h3>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Connect your sources or add your first enquiry manually to track potential sales and build relationships.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl shadow-lg transition-all" asChild>
                        <Link href="/enquiries/new">
                            <Plus className="mr-2 h-5 w-5" />
                            Add Your First Enquiry
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Scenario 2: Active Enquiries
    if (hasActiveEnquiries) {
        const visibleEnquiries = activeEnquiries.slice(0, 3)
        const awaitingCount = activeEnquiries.length
        const lastEnquiry = activeEnquiries[0]

        return (
            <Card className="overflow-hidden border-blue-500/10 bg-white dark:bg-slate-950 shadow-sm">
                <div className="flex flex-col md:flex-row min-h-[300px]">
                    {/* Content Side (70%) */}
                    <div className="flex-[0.7] p-6 lg:p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enquiries</h3>
                                <p className="text-sm text-muted-foreground">
                                    {awaitingCount} {awaitingCount === 1 ? 'enquiry' : 'enquiries'} needing your attention
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                <Link href="/enquiries">
                                    View All
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-3 flex-1">
                            {visibleEnquiries.map((enquiry) => (
                                <EnquiryListItem key={enquiry.id} enquiry={enquiry} />
                            ))}
                        </div>

                        <Button variant="outline" className="w-full mt-6 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl" asChild>
                            <Link href="/enquiries">
                                Manage All Enquiries
                            </Link>
                        </Button>
                    </div>

                    {/* Passive Awareness Panel (30%) */}
                    <div className="flex-[0.3] bg-blue-50/40 dark:bg-blue-950/10 flex flex-col items-center justify-center p-8 border-l border-blue-100/50 dark:border-blue-900/20 relative">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto text-blue-500">
                                <Clock size={28} />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {awaitingCount} {awaitingCount === 1 ? 'enquiry' : 'enquiries'} awaiting reply
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Last received: {lastEnquiry.date}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-blue-100/50 dark:border-blue-900/50 w-full text-left">
                                <div className="flex gap-2">
                                    <Sparkles size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                                        Tip: After replying on WhatsApp, mark as replied to keep your dashboard accurate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    // Scenario 3: All Converted/Dropped (Success State)
    return (
        <Card className="relative overflow-hidden border-green-500/10 bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-green-950/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl shadow-green-500/20" />

            <CardContent className="flex flex-col md:flex-row items-center py-10 px-8 gap-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-700 dark:text-green-400 text-sm font-medium mb-4">
                        <CheckCircle2 size={16} />
                        <span>All caught up!</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">You're on top of everything!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Congratulations! You've handled all your enquiries. Ready to focus on your next big sale?
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl" asChild>
                            <Link href="/orders">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Check Orders
                            </Link>
                        </Button>
                        <Button variant="outline" className="rounded-xl" asChild>
                            <Link href="/enquiries/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Enquiry
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="hidden md:flex flex-1 justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-green-500" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EnquiryListItem({ enquiry }: { enquiry: Enquiry }) {
    const isNew = enquiry.status === 'new'

    return (
        <Link
            href={`/enquiries/${enquiry.id}`}
            className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
        >
            <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNew ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                    <MessageSquare size={18} />
                </div>
                {isNew && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${isNew ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {enquiry.customerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {enquiry.date}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {enquiry.message}
                </p>
            </div>

            <ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
    )
}

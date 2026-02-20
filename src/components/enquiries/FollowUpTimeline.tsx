"use client";

import { useFollowUpActivities } from "@/lib/react-query/hooks/useEnquiries";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageCircle,
    Phone,
    StickyNote,
    ArrowRight,
    CalendarClock,
    Loader2,
    History,
} from "lucide-react";

interface FollowUpTimelineProps {
    enquiryId: string;
}

const ACTION_CONFIG: Record<string, {
    icon: typeof MessageCircle;
    label: string;
    color: string;
    bgColor: string;
}> = {
    whatsapp_sent: {
        icon: MessageCircle,
        label: "WhatsApp Sent",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    called: {
        icon: Phone,
        label: "Phone Call",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    note_added: {
        icon: StickyNote,
        label: "Note Added",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    status_changed: {
        icon: ArrowRight,
        label: "Status Changed",
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    follow_up_scheduled: {
        icon: CalendarClock,
        label: "Follow-Up Scheduled",
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
};

export function FollowUpTimeline({ enquiryId }: FollowUpTimelineProps) {
    const { data, isLoading } = useFollowUpActivities(enquiryId);
    const activities = data?.data || [];

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Activity Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No follow-up activity yet</p>
                        <p className="text-xs mt-1">Send a WhatsApp message or add a note to start tracking</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Activity Timeline
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {activities.length} {activities.length === 1 ? "entry" : "entries"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-4">
                        {activities.map((activity, index) => {
                            const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.note_added;
                            const Icon = config.icon;
                            const isLast = index === activities.length - 1;

                            return (
                                <div key={activity.id} className="relative flex gap-3 pl-1">
                                    {/* Timeline dot */}
                                    <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${config.bgColor}`}>
                                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium">{config.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {activity.note && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {activity.note}
                                            </p>
                                        )}

                                        {activity.whatsapp_message && (
                                            <div className="mt-1.5 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                                <p className="text-xs text-green-800 dark:text-green-300 whitespace-pre-wrap line-clamp-4">
                                                    {activity.whatsapp_message}
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

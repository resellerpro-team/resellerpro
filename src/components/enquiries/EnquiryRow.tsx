"use client";

import { Enquiry } from "@/lib/react-query/hooks/useEnquiries";
import { formatDistanceToNow } from "date-fns";
import {
    MoreHorizontal,
    MessageCircle,
    CheckCircle2,
    ShoppingCart,
    UserPlus,
    XCircle,
    Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface EnquiryRowProps {
    enquiry: Enquiry;
}

import { useUpdateEnquiry } from "@/lib/react-query/hooks/useEnquiries";
import { useRouter } from "next/navigation";

// ... (keep imports)

export function EnquiryRow({ enquiry }: EnquiryRowProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { mutate: updateEnquiry } = useUpdateEnquiry();

    const copyReply = () => {
        const text = `Hi ${enquiry.customer_name}, thanks for your enquiry about "${enquiry.message}".`;
        navigator.clipboard.writeText(text);
        toast({
            title: "Reply Copied",
            description: "WhatsApp reply copied to clipboard.",
        });
    };

    const updateStatus = (status: string) => {
        updateEnquiry({
            id: enquiry.id,
            status: status as "new" | "needs_follow_up" | "converted" | "dropped",
        }, {
            onSuccess: () => {
                toast({
                    title: "Status Updated",
                    description: `Enquiry marked as ${status.replace(/_/g, " ")}.`,
                });
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "new": return "default";
            case "needs_follow_up": return "secondary"; // or a warning color if available
            case "converted": return "outline"; // success usually green but using outline for now
            case "dropped": return "destructive";
            default: return "secondary";
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            {/* LEFT: Info */}
            <div className="flex-1 min-w-0 grid gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base truncate">{enquiry.customer_name}</h3>
                    <Badge variant={getStatusColor(enquiry.status) as any} className="capitalize">
                        {enquiry.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(enquiry.created_at), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{enquiry.phone}</span>
                </div>

                <p className="text-sm mt-1 line-clamp-2 text-foreground/90">
                    {enquiry.message}
                </p>
            </div>

            {/* RIGHT: Actions */}
            <div className="ml-4 flex items-center gap-2">
                <Button size="sm" variant="outline" className="hidden sm:flex" onClick={copyReply}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Reply
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/enquiries/${enquiry.id}`)}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyReply}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Copy WhatsApp Reply
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus("needs_follow_up")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus("converted")}>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Convert to Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus("converted")}>
                            <UserPlus className="mr-2 h-4 w-4" /> Convert to Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" /> Close Enquiry
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

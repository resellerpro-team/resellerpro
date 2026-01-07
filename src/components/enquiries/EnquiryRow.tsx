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
            case "needs_follow_up": return "secondary";
            case "converted": return "outline";
            case "dropped": return "destructive";
            default: return "secondary";
        }
    };

    const canMarkContacted = enquiry.status === "new";
    const canConvert = enquiry.status === "needs_follow_up";
    const canClose = enquiry.status === "new" || enquiry.status === "needs_follow_up";
    const isFinal = enquiry.status === "converted" || enquiry.status === "dropped";

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
                <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="w-[50%] bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
                    onClick={() => {
                        window.open(
                            `https://wa.me/${enquiry.phone?.replace(/\D/g, '')}`,
                            '_blank'
                        )
                    }}
                >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {canMarkContacted && (
                            <DropdownMenuItem onClick={() => updateStatus("needs_follow_up")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Contacted
                            </DropdownMenuItem>
                        )}

                        {canConvert && (
                            <DropdownMenuItem onClick={() => updateStatus("converted")}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Convert to Order
                            </DropdownMenuItem>
                        )}

                        {canClose && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => updateStatus("dropped")}
                                    className="text-destructive"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Close Enquiry
                                </DropdownMenuItem>
                            </>
                        )}

                        {isFinal && (
                            <DropdownMenuItem disabled className="opacity-60">
                                This enquiry is closed
                            </DropdownMenuItem>
                        )}

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

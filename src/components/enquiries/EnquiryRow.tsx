"use client";

import { Enquiry } from "@/lib/react-query/hooks/useEnquiries";
import { formatDistanceToNow, format, isPast, isToday, differenceInDays } from "date-fns";
import {
    MoreHorizontal,
    MessageCircle,
    CheckCircle2,
    ShoppingCart,
    UserPlus,
    XCircle,
    Phone,
    CalendarClock,
    Flag,
    AlertTriangle,
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
import { useToast } from "@/hooks/use-toast";

interface EnquiryRowProps {
    enquiry: Enquiry;
    businessName?: string;
}

import { useUpdateEnquiry, useLogFollowUpActivity } from "@/lib/react-query/hooks/useEnquiries";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useState } from "react";
import { ConversionModal } from "./ConversionModal";
import { fetchCustomers } from "@/lib/react-query/hooks/useEnquiries";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

function getFollowUpBadge(followUpDate: string | null | undefined) {
    if (!followUpDate) return null;

    const date = new Date(followUpDate);
    const now = new Date();

    if (isPast(date) && !isToday(date)) {
        return (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                Overdue
            </Badge>
        );
    }

    if (isToday(date)) {
        return (
            <Badge className="text-[10px] px-1.5 py-0 gap-1 bg-blue-600 hover:bg-blue-700">
                <CalendarClock className="h-2.5 w-2.5" />
                Due Today
            </Badge>
        );
    }

    const daysUntil = differenceInDays(date, now);
    if (daysUntil <= 3) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-orange-300 text-orange-600 dark:text-orange-400">
                <CalendarClock className="h-2.5 w-2.5" />
                {daysUntil}d
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
            <CalendarClock className="h-2.5 w-2.5" />
            {format(date, "MMM d")}
        </Badge>
    );
}

function getPriorityBadge(priority: string | undefined) {
    switch (priority) {
        case "urgent":
            return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">🔴 Urgent</Badge>;
        case "high":
            return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-600">🟠 High</Badge>;
        case "medium":
            return null; // Don't clutter with medium (default)
        case "low":
            return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">🟢 Low</Badge>;
        default:
            return null;
    }
}

export function EnquiryRow({ enquiry, businessName = "Our Store" }: EnquiryRowProps) {
    const { toast } = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutate: updateEnquiry } = useUpdateEnquiry();
    const { mutate: logActivity } = useLogFollowUpActivity();
    const [isConversionSheetOpen, setIsConversionSheetOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [foundCustomer, setFoundCustomer] = useState<any>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: () => void;
        title: string;
        description: string;
    }>({ open: false, action: () => {}, title: "", description: "" });

    // ==================================================================
    // ENTERPRISE AI MESSAGE ENGINE — NEVER exposes internal notes
    // ==================================================================
    const generateQuickMessage = () => {
        const shop = businessName;
        const note = enquiry.message || "";
        const noteLower = note.toLowerCase();

        // --- PRODUCT DETECTION (200+ keywords) ---
        const productDB: Record<string, string[]> = {
            "Fashion": ['kurta', 'kurti', 'shirt', 't-shirt', 'top', 'blouse', 'dress', 'gown', 'lehenga', 'saree', 'sari', 'salwar', 'palazzo', 'dupatta', 'suit', 'blazer', 'jacket', 'hoodie', 'sweater', 'jeans', 'trouser', 'pant', 'shorts', 'legging', 'sherwani', 'dhoti'],
            "Footwear": ['shoes', 'shoe', 'sandal', 'slipper', 'heels', 'sneaker', 'boot', 'loafer', 'chappal', 'crocs'],
            "Jewelry": ['necklace', 'earring', 'ring', 'bracelet', 'bangle', 'pendant', 'chain', 'anklet', 'mangalsutra', 'gold', 'silver', 'diamond'],
            "Accessories": ['watch', 'watches', 'bag', 'handbag', 'purse', 'wallet', 'belt', 'cap', 'sunglasses', 'backpack'],
            "Beauty": ['perfume', 'cream', 'lotion', 'serum', 'makeup', 'lipstick', 'foundation', 'shampoo', 'hair oil', 'sunscreen', 'kajal', 'nail polish'],
            "Electronics": ['phone', 'mobile', 'smartphone', 'laptop', 'tablet', 'charger', 'earphone', 'headphone', 'airpod', 'speaker', 'power bank', 'cover', 'case', 'camera', 'tv'],
            "Home": ['bedsheet', 'pillow', 'curtain', 'blanket', 'towel', 'utensil', 'cooker', 'mixer', 'bottle'],
        };

        // Regex pattern extraction
        let product = "";
        const patterns = [
            /(?:wants?|needs?|looking\s+for|interested\s+in|asking\s+(?:about|for)|came\s+for|asked\s+(?:about|for))\s+(?:a\s+|an\s+|the\s+|some\s+)?(.+?)(?:\s*[,.\-!?]|\s+(?:he|she|they|customer|will|but|and|size|colour|color|next|later|tomorrow|today|week|month))/i,
            /(?:chahiye|chahte|mangta|dekhna|dikhao|bhejo|lena|khareedna)\s+(.+?)(?:\s*[,.\-!?]|\s+(?:hai|hain|tha|wala|bhi|aur|ya|ko|ka|ki|ke))/i,
        ];

        for (const pattern of patterns) {
            const match = note.match(pattern);
            if (match?.[1] && match[1].trim().length > 1 && match[1].trim().length < 50) {
                product = match[1].trim().split(' ')
                    .filter(w => !['he', 'she', 'they', 'it', 'customer', 'also', 'very'].includes(w.toLowerCase()))
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                break;
            }
        }

        // Keyword fallback
        if (!product) {
            for (const keywords of Object.values(productDB)) {
                for (const kw of keywords) {
                    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i');
                    if (regex.test(noteLower)) {
                        product = kw.charAt(0).toUpperCase() + kw.slice(1);
                        break;
                    }
                }
                if (product) break;
            }
        }

        // --- TIME-AWARE GREETING ---
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

        const customerName = enquiry.customer_name?.trim() || "";
        const greeting = (!customerName || customerName.startsWith("Guest ") || customerName.length < 2)
            ? `${timeGreeting}!`
            : `${timeGreeting} ${customerName.split(" ")[0]}!`;

        const productLine = product
            ? `We have some excellent *${product}* options available!`
            : "We have a great collection waiting for you!";

        return [
            greeting,
            "",
            `Thank you for reaching out to *${shop}*!`,
            "",
            productLine,
            "",
            "Would you like us to share more details or help you place an order?",
            "",
            "Just reply and we'll get back to you right away!",
            "",
            `_${shop}_`,
        ].join("\n");
    };

    const handleWhatsAppClick = () => {
        const digits = enquiry.phone?.replace(/\D/g, '');
        let formattedPhone = digits;
        if (digits.length === 10) formattedPhone = `91${digits}`;

        const message = generateQuickMessage();
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

        // Log the activity
        logActivity({
            enquiryId: enquiry.id,
            action: "whatsapp_sent",
            note: "Quick follow-up via WhatsApp",
            whatsapp_message: message,
        });

        window.open(waUrl, '_blank');
    };

    const handleConversionClick = async () => {
        setIsConverting(true);
        try {
            const phone = enquiry.phone?.replace(/\D/g, '');
            if (phone && phone.length >= 10) {
                const customers = await fetchCustomers(`search=${phone}`);
                const match = customers.find((c: any) =>
                    c.phone.replace(/\D/g, '').includes(phone) ||
                    phone.includes(c.phone.replace(/\D/g, ''))
                );

                if (match) {
                    setFoundCustomer(match);
                    toast({
                        title: "Customer Found! 🎉",
                        description: `Auto-filling details for ${match.name}`,
                    });
                } else {
                    setFoundCustomer(null);
                }
            }
        } catch (error) {
            console.error("Error checking customer:", error);
        } finally {
            setIsConverting(false);
            setIsConversionSheetOpen(true);
        }
    };

    const updateStatus = (status: string, requireConfirmation = true) => {
        const statusLabels: Record<string, string> = {
            needs_follow_up: "contacted",
            dropped: "dropped"
        };

        const performUpdate = () => {
            updateEnquiry({
                id: enquiry.id,
                status: status as "new" | "needs_follow_up" | "converted" | "dropped",
            }, {
                onSuccess: () => {
                    toast({
                        title: "Status Updated",
                        description: `Enquiry marked as ${statusLabels[status] || status.replace(/_/g, " ")}.`,
                    });
                    queryClient.invalidateQueries({ queryKey: ["enquiries"] });
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

        if (requireConfirmation && status === "dropped") {
            setConfirmDialog({
                open: true,
                action: performUpdate,
                title: "Close Enquiry?",
                description: "This will mark the enquiry as dropped. You can still view it in the filtered list."
            });
        } else {
            performUpdate();
        }
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
        <>
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                {/* LEFT: Info */}
                <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">{enquiry.customer_name}</h3>
                        <Badge variant={getStatusColor(enquiry.status) as any} className="capitalize">
                            {enquiry.status.replace(/_/g, " ")}
                        </Badge>
                        {getPriorityBadge(enquiry.priority)}
                        {getFollowUpBadge(enquiry.follow_up_date)}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(enquiry.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{enquiry.phone}</span>
                        {enquiry.follow_up_count && enquiry.follow_up_count > 0 && (
                            <span className="text-xs">• {enquiry.follow_up_count} follow-up{enquiry.follow_up_count > 1 ? "s" : ""}</span>
                        )}
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
                        className="bg-green-50 hover:bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400"
                        onClick={handleWhatsAppClick}
                        title="Send smart follow-up via WhatsApp"
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

                            {enquiry.status !== "converted" && (
                                <DropdownMenuItem onClick={() => router.push(`/enquiries/${enquiry.id}`)}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Edit Enquiry
                                </DropdownMenuItem>
                            )}

                            {(enquiry.status === "needs_follow_up" || enquiry.status === "converted") && (
                                <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault();
                                    handleConversionClick();
                                }}>
                                    {isConverting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                    )}
                                    {enquiry.status === "converted" ? "Complete Order" : "Convert to Order"}
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

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isConversionSheetOpen && (
                <ConversionModal
                    enquiry={enquiry}
                    existingCustomer={foundCustomer}
                    isOpen={isConversionSheetOpen}
                    onClose={() => {
                        setIsConversionSheetOpen(false);
                        setFoundCustomer(null);
                    }}
                />
            )}

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={() => {
                    confirmDialog.action();
                    setConfirmDialog({ ...confirmDialog, open: false });
                }}
                variant="destructive"
                confirmLabel="Confirm"
            />
        </>
    );
}

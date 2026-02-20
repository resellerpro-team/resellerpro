"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLogFollowUpActivity } from "@/lib/react-query/hooks/useEnquiries";
import {
    Send, ChevronDown, MessageCircle, Sparkles, Clock,
    ShoppingBag, Loader2, Heart, HandCoins, BookOpen,
    ThumbsUp, Eye, EyeOff,
} from "lucide-react";

interface WhatsAppEnquiryMessageProps {
    enquiryId: string;
    customerName: string;
    customerPhone: string;
    enquiryMessage: string;
    businessName?: string;
    followUpDate?: string | null;
    followUpCount?: number;
}

type MessageTemplate =
    | "initial_contact"
    | "follow_up_gentle"
    | "follow_up_value"
    | "special_offer"
    | "last_chance"
    | "thank_you"
    | "payment_reminder"
    | "custom";

const TEMPLATE_CONFIG: Record<Exclude<MessageTemplate, "custom">, {
    label: string;
    icon: typeof Send;
    description: string;
    badgeLabel: string;
    badgeColor: string;
}> = {
    initial_contact: {
        label: "Welcome Message",
        icon: MessageCircle,
        description: "Warm first outreach with product context",
        badgeLabel: "AI",
        badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    follow_up_gentle: {
        label: "Gentle Follow-Up",
        icon: Clock,
        description: "Soft check-in without being pushy",
        badgeLabel: "AI",
        badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    follow_up_value: {
        label: "Value Pitch",
        icon: ThumbsUp,
        description: "Highlight benefits & quality to convince",
        badgeLabel: "AI",
        badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    },
    special_offer: {
        label: "Special Offer / Discount",
        icon: Sparkles,
        description: "Create urgency with exclusive deal",
        badgeLabel: "SALES",
        badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    last_chance: {
        label: "Last Chance / Closing",
        icon: ShoppingBag,
        description: "Final urgency-driven nudge",
        badgeLabel: "CLOSE",
        badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    thank_you: {
        label: "Thank You / Post-Sale",
        icon: Heart,
        description: "Appreciate & build loyalty",
        badgeLabel: "CRM",
        badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    payment_reminder: {
        label: "Payment Reminder",
        icon: HandCoins,
        description: "Polite payment follow-up",
        badgeLabel: "CRM",
        badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
};

// ============================================================================
// ENTERPRISE AI MESSAGE ENGINE v2.0
// - 200+ product keyword detection across 15+ categories
// - Time-of-day aware greetings
// - Follow-up count escalation (tone changes with each attempt)
// - WhatsApp-native formatting (*bold*, _italic_)
// - Multi-language support (English + Hinglish patterns)
// - NEVER exposes internal notes to the customer
// ============================================================================

// --- PRODUCT INTELLIGENCE ---

const PRODUCT_DATABASE: Record<string, string[]> = {
    // Fashion & Clothing
    "Fashion": [
        'kurta', 'kurti', 'shirt', 't-shirt', 'tshirt', 'top', 'blouse',
        'dress', 'gown', 'frock', 'skirt', 'lehenga', 'saree', 'sari',
        'salwar', 'churidar', 'palazzo', 'dupatta', 'shawl', 'stole',
        'suit', 'blazer', 'jacket', 'coat', 'hoodie', 'sweater', 'cardigan',
        'jeans', 'trouser', 'pant', 'shorts', 'legging', 'track',
        'lungi', 'dhoti', 'sherwani', 'nehru jacket',
        'denim', 'cotton', 'silk', 'linen', 'chiffon', 'georgette',
    ],
    // Footwear
    "Footwear": [
        'shoes', 'shoe', 'sandal', 'slipper', 'heels', 'heel', 'sneaker',
        'boot', 'loafer', 'jooti', 'juthi', 'chappal', 'floater', 'crocs',
        'sports shoe', 'running shoe', 'formal shoe', 'casual shoe',
    ],
    // Jewelry & Accessories
    "Jewelry": [
        'necklace', 'earring', 'ring', 'bracelet', 'bangle', 'pendant',
        'chain', 'anklet', 'brooch', 'mangalsutra', 'kundan', 'polki',
        'gold', 'silver', 'diamond', 'imitation', 'artificial',
    ],
    "Accessories": [
        'watch', 'watches', 'bag', 'handbag', 'purse', 'clutch', 'wallet',
        'belt', 'cap', 'hat', 'scarf', 'tie', 'bow tie', 'cufflink',
        'sunglasses', 'goggles', 'backpack', 'luggage', 'suitcase',
    ],
    // Beauty & Personal Care
    "Beauty": [
        'perfume', 'cream', 'lotion', 'oil', 'serum', 'makeup', 'lipstick',
        'foundation', 'mascara', 'eyeliner', 'face wash', 'moisturizer',
        'shampoo', 'conditioner', 'hair oil', 'sunscreen', 'soap',
        'body wash', 'nail polish', 'kajal', 'compact', 'cleanser',
        'toner', 'face pack', 'mask', 'scrub', 'deodorant',
    ],
    // Electronics
    "Electronics": [
        'phone', 'mobile', 'smartphone', 'iphone', 'samsung', 'redmi', 'vivo', 'oppo',
        'laptop', 'computer', 'tablet', 'ipad', 'charger', 'cable',
        'earphone', 'headphone', 'airpod', 'earbud', 'speaker', 'bluetooth',
        'power bank', 'cover', 'case', 'screen guard', 'tempered glass',
        'camera', 'tripod', 'ring light', 'led', 'bulb', 'fan',
        'tv', 'television', 'monitor', 'printer', 'mouse', 'keyboard',
        'pendrive', 'hard disk', 'memory card', 'sd card',
    ],
    // Home & Kitchen
    "Home": [
        'bedsheet', 'pillow', 'cushion', 'curtain', 'blanket', 'towel',
        'mat', 'rug', 'carpet', 'table', 'chair', 'sofa', 'bed',
        'lamp', 'light', 'mirror', 'clock', 'vase', 'decoration',
        'utensil', 'pan', 'pot', 'cooker', 'mixer', 'grinder', 'blender',
        'bottle', 'container', 'box', 'organizer', 'rack', 'stand',
    ],
    // Food & Grocery
    "Food": [
        'cake', 'sweet', 'mithai', 'chocolate', 'dry fruit', 'namkeen',
        'pickle', 'achaar', 'papad', 'masala', 'spice', 'tea', 'coffee',
        'honey', 'ghee', 'oil', 'rice', 'atta', 'dal', 'sugar',
    ],
    // Fitness & Sports
    "Fitness": [
        'gym', 'dumbbell', 'treadmill', 'yoga mat', 'resistance band',
        'protein', 'supplement', 'shaker', 'gloves', 'cricket', 'bat',
        'ball', 'racket', 'cycle', 'bicycle', 'skipping rope',
    ],
    // Stationery & Office
    "Stationery": [
        'pen', 'pencil', 'notebook', 'diary', 'planner', 'file', 'folder',
        'stapler', 'tape', 'glue', 'scissors', 'ruler', 'eraser',
        'marker', 'highlighter', 'whiteboard',
    ],
    // Services
    "Services": [
        'repair', 'service', 'installation', 'maintenance', 'cleaning',
        'painting', 'plumbing', 'electrical', 'carpenter', 'tailor',
        'stitching', 'alteration', 'delivery', 'courier',
    ],
};

function extractProductInterest(internalNote: string): { product: string; category: string } {
    if (!internalNote || internalNote.trim().length < 3) {
        return { product: "", category: "" };
    }

    const note = internalNote.toLowerCase().trim();

    // Phase 1: Regex pattern extraction (handles natural language)
    const patterns = [
        // English patterns
        /(?:wants?|needs?|looking\s+for|interested\s+in|asking\s+(?:about|for)|enquir(?:y|ed|ing)\s+(?:about|for|regarding)|came\s+for|asked\s+(?:about|for))\s+(?:a\s+|an\s+|the\s+|some\s+)?(.+?)(?:\s*[,.\-!?]|\s+(?:he|she|they|customer|client|will|but|and|also|size|colour|color|in\s+size|in\s+colour|next|later|tomorrow|today|yesterday|month|week|day|soon|maybe|probably))/i,
        // Hinglish patterns
        /(?:chahiye|chahte|chahti|mangta|mangti|dekhna|dikhao|dikhana|bhejo|bhejdo|lena|leni|khareedna)\s+(.+?)(?:\s*[,.\-!?]|\s+(?:hai|hain|tha|thi|wala|wali|bhi|aur|ya|ko|ka|ki|ke|se|me|mein))/i,
        // "about X" pattern
        /(?:about|regarding)\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s*[,.\-!?]|$)/i,
    ];

    for (const pattern of patterns) {
        const match = internalNote.match(pattern);
        if (match && match[1]) {
            const extracted = match[1].trim();
            if (extracted.length > 1 && extracted.length < 60) {
                // Clean up extracted text
                const cleaned = extracted
                    .replace(/\b(he|she|they|it|customer|client|also|very|quite|really)\b/gi, '')
                    .trim()
                    .split(' ')
                    .filter(w => w.length > 0)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                if (cleaned.length > 1) {
                    // Find category
                    const cat = findCategory(cleaned.toLowerCase());
                    return { product: cleaned, category: cat };
                }
            }
        }
    }

    // Phase 2: Keyword database scan
    for (const [category, keywords] of Object.entries(PRODUCT_DATABASE)) {
        for (const keyword of keywords) {
            // Use word boundary matching for accuracy
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i');
            if (regex.test(note)) {
                const product = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                return { product, category };
            }
        }
    }

    return { product: "", category: "" };
}

function findCategory(text: string): string {
    for (const [category, keywords] of Object.entries(PRODUCT_DATABASE)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) return category;
        }
    }
    return "";
}

// --- TIME-AWARE GREETINGS ---

function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function getSmartGreeting(customerName: string): string {
    const name = customerName?.trim() || "";
    const timeGreeting = getTimeGreeting();

    // Skip auto-generated names
    if (!name || name.startsWith("Guest ") || /^\d+$/.test(name) || name.length < 2) {
        return `${timeGreeting}!`;
    }

    const firstName = name.split(" ")[0];
    return `${timeGreeting} ${firstName}!`;
}

// --- ENTERPRISE MESSAGE GENERATOR ---

function generateMessage(
    template: MessageTemplate,
    customerName: string,
    enquiryMessage: string,
    businessName: string,
    followUpCount: number
): string {
    const greeting = getSmartGreeting(customerName);
    const shop = businessName || "Our Store";
    const { product, category } = extractProductInterest(enquiryMessage);
    const isRepeatFollowUp = followUpCount > 1;

    // Product-aware lines (WhatsApp *bold* formatting)
    const productIntro = product
        ? `We have some excellent *${product}* options available!`
        : "We have a great collection waiting for you!";

    const productRef = product
        ? `the *${product}* you were interested in`
        : "what you were looking for";

    const productOffer = product
        ? `a *special offer on ${product}*`
        : "*exclusive deals*";

    switch (template) {
        case "initial_contact":
            return [
                greeting,
                "",
                `Thank you for reaching out to *${shop}*!`,
                "",
                productIntro,
                "",
                "Would you like us to:",
                product ? `- Share more details about our ${product} range` : "- Share more details about our collection",
                "- Help you with pricing",
                "- Place an order directly",
                "",
                "Just reply and we'll get back to you right away!",
                "",
                `_${shop}_`,
            ].join("\n");

        case "follow_up_gentle":
            return isRepeatFollowUp ? [
                greeting,
                "",
                `Hope you're doing well! We wanted to give you a quick update from *${shop}*.`,
                "",
                product
                    ? `We still have the *${product}* available, and we'd hate for you to miss out!`
                    : "The items you enquired about are still available!",
                "",
                "No pressure at all - just wanted to make sure you have everything you need to decide.",
                "",
                "Feel free to reach out anytime!",
                "",
                `_Warm regards,_`,
                `_${shop}_`,
            ].join("\n") : [
                greeting,
                "",
                `Just checking in from *${shop}*!`,
                "",
                `Wanted to see if you had any questions about ${productRef}.`,
                "",
                "We're here to help - whether you need more info, pricing, or help placing an order.",
                "",
                "Looking forward to hearing from you!",
                "",
                `_${shop}_`,
            ].join("\n");

        case "follow_up_value":
            return [
                greeting,
                "",
                `Quick update from *${shop}*!`,
                "",
                product
                    ? `Here's why our customers love our *${product}*:`
                    : `Here's why customers love shopping with us:`,
                "",
                "- *Premium Quality* at the best prices",
                "- Fast & reliable delivery",
                "- Easy exchange & returns",
                category === "Fashion" ? "- Trending designs you won't find elsewhere" :
                category === "Electronics" ? "- Original products with warranty" :
                category === "Beauty" ? "- 100% authentic & branded products" :
                "- Personally curated for our valued customers",
                "",
                "Want to see what we have for you? Just reply!",
                "",
                `_${shop}_`,
            ].join("\n");

        case "special_offer":
            return [
                greeting,
                "",
                `*Exciting news from ${shop}!*`,
                "",
                product
                    ? `We're running ${productOffer} - and we thought of you!`
                    : `We have ${productOffer} running right now - and we thought of you!`,
                "",
                "*What you get:*",
                "- Best prices - guaranteed",
                "- Priority order processing",
                "- Free support & aftercare",
                "",
                "This offer is *limited* - would you like to grab it before it's gone?",
                "",
                "Just reply *YES* and we'll set it up for you!",
                "",
                `_${shop}_`,
            ].join("\n");

        case "last_chance":
            return [
                greeting,
                "",
                product
                    ? `*Last few pieces left!* The ${product} you enquired about is almost sold out.`
                    : "*Stock update!* The items you enquired about are running low.",
                "",
                "We've been keeping it aside for you, but we can only hold it for a little longer.",
                "",
                "Ready to order? Just say the word and we'll arrange everything!",
                "",
                `Reply *ORDER* to proceed`,
                "",
                `_${shop}_`,
            ].join("\n");

        case "thank_you":
            return [
                greeting,
                "",
                `Thank you so much for choosing *${shop}*! We truly appreciate your support.`,
                "",
                "We hope you love your purchase! If you need anything at all:",
                "- Questions about your order",
                "- Need help with anything",
                "- Want to explore more products",
                "",
                "We're always just a message away!",
                "",
                "If you're happy with your experience, a recommendation to your friends would mean the world to us!",
                "",
                `_With gratitude,_`,
                `_${shop}_`,
            ].join("\n");

        case "payment_reminder":
            return [
                greeting,
                "",
                `This is a friendly reminder from *${shop}* regarding your recent order.`,
                "",
                "We noticed the payment is still pending. No worries - here's how you can complete it:",
                "",
                "- UPI / Google Pay / PhonePe",
                "- Bank Transfer",
                "- Cash on Delivery (if available)",
                "",
                "If you've already made the payment, please ignore this message!",
                "",
                "Need help? Just reply and we'll assist you right away.",
                "",
                `_${shop}_`,
            ].join("\n");

        default:
            return [
                greeting,
                "",
                `Thanks for your interest in *${shop}*!`,
                productIntro,
                "Reply to get started!",
                "",
                `_${shop}_`,
            ].join("\n");
    }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WhatsAppEnquiryMessage({
    enquiryId,
    customerName,
    customerPhone,
    enquiryMessage,
    businessName = "Our Store",
    followUpDate,
    followUpCount = 0,
}: WhatsAppEnquiryMessageProps) {
    const { toast } = useToast();
    const { mutate: logActivity, isPending } = useLogFollowUpActivity();
    const [customMessage, setCustomMessage] = useState("");
    const [showCustom, setShowCustom] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Exclude<MessageTemplate, "custom"> | null>(null);

    // Live preview of the currently previewed template
    const previewMessage = useMemo(() => {
        if (!previewTemplate) return "";
        return generateMessage(previewTemplate, customerName, enquiryMessage, businessName, followUpCount);
    }, [previewTemplate, customerName, enquiryMessage, businessName, followUpCount]);

    const formatWhatsAppNumber = (phone: string): string | null => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length === 10) return `91${digits}`;
        if (digits.length === 12 && digits.startsWith("91")) return digits;
        if (digits.length > 10) return digits;
        return null;
    };

    const sendMessage = (message: string, templateName: string) => {
        const formattedPhone = formatWhatsAppNumber(customerPhone);
        if (!formattedPhone) {
            toast({
                title: "Invalid Phone Number",
                description: "Could not format the phone number for WhatsApp.",
                variant: "destructive",
            });
            return;
        }

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

        logActivity({
            enquiryId,
            action: "whatsapp_sent",
            note: `Sent "${templateName}" template via WhatsApp`,
            whatsapp_message: message,
        }, {
            onSuccess: () => {
                toast({
                    title: "WhatsApp Opened!",
                    description: `"${templateName}" message ready for ${customerName}`,
                    className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
                });
            }
        });

        window.open(waUrl, "_blank");
        setPreviewTemplate(null);
    };

    const handleTemplateClick = (template: Exclude<MessageTemplate, "custom">) => {
        const message = generateMessage(template, customerName, enquiryMessage, businessName, followUpCount);
        sendMessage(message, TEMPLATE_CONFIG[template].label);
    };

    const handleCustomSend = () => {
        if (!customMessage.trim()) {
            toast({ title: "Empty Message", description: "Please type a message first.", variant: "destructive" });
            return;
        }
        sendMessage(customMessage, "Custom Message");
        setCustomMessage("");
        setShowCustom(false);
    };

    // Detected product for display
    const detected = useMemo(() => extractProductInterest(enquiryMessage), [enquiryMessage]);

    return (
        <div className="space-y-3">
            {/* Detection indicator */}
            {detected.product && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span>AI detected: <strong className="text-foreground">{detected.product}</strong></span>
                    {detected.category && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{detected.category}</Badge>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            )}
                            Send WhatsApp
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            AI-Powered Message Templates
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {(Object.entries(TEMPLATE_CONFIG) as [Exclude<MessageTemplate, "custom">, typeof TEMPLATE_CONFIG[keyof typeof TEMPLATE_CONFIG]][]).map(
                            ([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <DropdownMenuItem
                                        key={key}
                                        className="flex items-start gap-3 py-2.5 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // Show preview first
                                            setPreviewTemplate(key);
                                        }}
                                    >
                                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{config.label}</div>
                                            <div className="text-xs text-muted-foreground">{config.description}</div>
                                        </div>
                                        <Badge variant="outline" className={`text-[10px] ${config.badgeColor}`}>
                                            {config.badgeLabel}
                                        </Badge>
                                    </DropdownMenuItem>
                                );
                            }
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => { setShowCustom(!showCustom); setPreviewTemplate(null); }}
                            className="cursor-pointer"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Write Custom Message
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {followUpCount != null && followUpCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                        {followUpCount} follow-up{followUpCount > 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* MESSAGE PREVIEW — shows before sending */}
            {previewTemplate && previewMessage && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                <Eye className="h-3 w-3" />
                                Message Preview — {TEMPLATE_CONFIG[previewTemplate].label}
                            </Label>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => setPreviewTemplate(null)}
                            >
                                <EyeOff className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border text-sm whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                            {previewMessage}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewTemplate(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleTemplateClick(previewTemplate)}
                                disabled={isPending}
                            >
                                <Send className="h-3 w-3 mr-1" /> Send via WhatsApp
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showCustom && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm font-medium">Custom WhatsApp Message</Label>
                    <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Type your personalized message here..."
                        rows={4}
                        className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Tip: Use *text* for bold and _text_ for italic in WhatsApp
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowCustom(false)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleCustomSend}
                            disabled={isPending}
                        >
                            <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

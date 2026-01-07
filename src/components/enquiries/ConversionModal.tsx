"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, ChevronDown, ChevronRight, Trash2, CheckCircle2 } from "lucide-react";
import { Enquiry } from "@/lib/react-query/hooks/useEnquiries";
import { parseWhatsAppMessage } from "@/lib/utils/whatsapp-parser";
import { convertEnquiryToOrder } from "@/app/(dashboard)/enquiries/actions";
import { useProducts } from "@/lib/react-query/hooks/useProducts";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ConversionModalProps {
    enquiry: Enquiry;
    existingCustomer?: any;
    isOpen: boolean;
    onClose: () => void;
}

const formSchema = z.object({
    // Customer
    customerName: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().optional(),

    // Address
    addressLine1: z.string().min(3, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(6, "Pincode is required"),

    // Order
    orderItems: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
    })).min(1, "At least one product is required"),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CustomAccordionItem = ({
    title,
    value,
    activeValue,
    onToggle,
    children,
    badge
}: {
    title: string,
    value: string,
    activeValue: string,
    onToggle: (val: string) => void,
    children: React.ReactNode,
    badge?: React.ReactNode
}) => {
    const isOpen = value === activeValue;
    return (
        <div className="border rounded-lg bg-background mb-4 overflow-hidden">
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => onToggle(isOpen ? "" : value)}
            >
                <div className="flex items-center gap-3">
                    {badge}
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export function ConversionModal({ enquiry, existingCustomer, isOpen, onClose }: ConversionModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Convert to Order
                        </DialogTitle>
                        <DialogDescription>
                            Create a new customer and order from this enquiry.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Content is same, extracted below */}
                    <ConversionFormContent enquiry={enquiry} existingCustomer={existingCustomer} onClose={onClose} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[95%] p-0 flex flex-col rounded-t-xl">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Convert to Order
                    </SheetTitle>
                    <SheetDescription>
                        Create a new customer and order from this enquiry.
                    </SheetDescription>
                </SheetHeader>
                <ConversionFormContent enquiry={enquiry} existingCustomer={existingCustomer} onClose={onClose} />
            </SheetContent>
        </Sheet>
    );
}

function ConversionFormContent({ enquiry, existingCustomer, onClose }: { enquiry: Enquiry, existingCustomer?: any, onClose: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    // @ts-ignore
    const { data: productsData } = useProducts();
    const products = productsData || [];

    const [activeSection, setActiveSection] = useState<string>("customer");
    const [isProcessingPaste, setIsProcessingPaste] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: existingCustomer?.name || enquiry.customer_name || "",
            phone: existingCustomer?.phone || enquiry.phone || "",
            email: existingCustomer?.email || "",
            addressLine1: existingCustomer?.address_line1 || existingCustomer?.address || "",
            addressLine2: existingCustomer?.address_line2 || "",
            city: existingCustomer?.city || "",
            state: existingCustomer?.state || "",
            pincode: existingCustomer?.pincode || "",
            orderItems: [],
            notes: enquiry.message || "",
        }
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const orderItems = watch("orderItems");

    const handleSmartPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text.trim()) {
                if (enquiry.message) {
                    processSmartPaste(enquiry.message);
                } else {
                    toast({ title: "Clipboard is empty", variant: "destructive" });
                }
                return;
            }
            processSmartPaste(text);
        } catch (err) {
            if (enquiry.message) {
                processSmartPaste(enquiry.message);
            } else {
                toast({ title: "Clipboard access denied", description: "Using enquiry message instead.", variant: "default" });
                if (enquiry.message) processSmartPaste(enquiry.message);
            }
        }
    };

    const processSmartPaste = (text: string) => {
        setIsProcessingPaste(true);
        setTimeout(() => {
            const result = parseWhatsAppMessage(text);

            if (result.name) setValue("customerName", result.name);
            if (result.phone) setValue("phone", result.phone);
            if (result.email) setValue("email", result.email || "");
            if (result.addressLine1) setValue("addressLine1", result.addressLine1);
            if (result.addressLine2) setValue("addressLine2", result.addressLine2 || "");
            if (result.city) setValue("city", result.city);
            if (result.state) setValue("state", result.state);
            if (result.pincode) setValue("pincode", result.pincode);

            toast({
                title: "Data Extracted ✨",
                description: `Confidence: ${result.confidence}%. Please review fields.`,
            });
            setIsProcessingPaste(false);

            if (result.name && result.phone) {
                setActiveSection("address");
            }
        }, 500);
    };

    const addProduct = (productId: string) => {
        // @ts-ignore
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentItems = form.getValues("orderItems");
        if (currentItems.find(i => i.productId === productId)) {
            toast({ title: "Product already added", variant: "destructive" });
            return;
        }

        setValue("orderItems", [...currentItems, {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.selling_price
        }]);
    };

    const removeProduct = (index: number) => {
        const currentItems = form.getValues("orderItems");
        setValue("orderItems", currentItems.filter((_, i) => i !== index));
    };

    const onSubmit = (data: FormData) => {
        if (orderItems.length === 0) {
            toast({ variant: "destructive", title: "Wait!", description: "Please add at least one product." });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("enquiryId", enquiry.id);
            formData.append("customerName", data.customerName);
            formData.append("phone", data.phone);
            formData.append("email", data.email || "");
            formData.append("addressLine1", data.addressLine1);
            formData.append("addressLine2", data.addressLine2 || "");
            formData.append("city", data.city);
            formData.append("state", data.state);
            formData.append("pincode", data.pincode);
            formData.append("notes", data.notes || "");
            formData.append("items", JSON.stringify(data.orderItems));

            const total = data.orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            formData.append("totalAmount", total.toString());

            const result = await convertEnquiryToOrder(formData);

            if (result.success) {
                toast({ title: "Conversion Successful! 🎉", description: `Order #${result.orderNumber} created.` });
                onClose();
                router.push("/orders"); // Redirect to orders page
            } else {
                toast({ title: "Conversion Failed", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <>
            <form
                id="conversion-form"
                onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.error("Form Validation Errors:", errors);
                    toast({
                        title: "Check form fields",
                        description: "Please fill in all required fields correctly.",
                        variant: "destructive"
                    });
                })}
                className="flex flex-col h-full overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSmartPaste}
                            disabled={isProcessingPaste}
                            className="w-full gap-2 "
                        >
                            <Sparkles className="h-4 w-4" />
                            {isProcessingPaste ? "Analyzing..." : "Auto-Fill from Clipboard / Message"}
                        </Button>
                    </div>

                    {existingCustomer && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Customer data auto-filled from database</span>
                        </div>
                    )}

                    {/* Customer Section */}
                    <CustomAccordionItem
                        title="Customer Details"
                        value="customer"
                        activeValue={activeSection}
                        onToggle={setActiveSection}
                        badge={
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${errors.customerName || errors.phone ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>1</div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input {...register("customerName")} placeholder="Customer Name" className={errors.customerName ? "border-red-500" : ""} />
                                {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone *</label>
                                    <Input {...register("phone")} placeholder="Phone" className={errors.phone ? "border-red-500" : ""} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input {...register("email")} placeholder="Optional" />
                                </div>
                            </div>
                        </div>
                    </CustomAccordionItem>

                    {/* Address Section */}
                    <CustomAccordionItem
                        title="Delivery Address"
                        value="address"
                        activeValue={activeSection}
                        onToggle={setActiveSection}
                        badge={
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${errors.addressLine1 || errors.city ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>2</div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address Line 1 *</label>
                                <Input {...register("addressLine1")} placeholder="House, Building, Area" />
                                {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address Line 2</label>
                                <Input {...register("addressLine2")} placeholder="Landmark, Street (Optional)" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City *</label>
                                    <Input {...register("city")} placeholder="City" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">State *</label>
                                    <Input {...register("state")} placeholder="State" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pincode *</label>
                                <Input {...register("pincode")} placeholder="6-digit Pincode" className="w-1/2" />
                            </div>
                        </div>
                    </CustomAccordionItem>

                    {/* Order Section */}
                    <CustomAccordionItem
                        title="Order Items"
                        value="order"
                        activeValue={activeSection}
                        onToggle={setActiveSection}
                        badge={
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${errors.orderItems ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>3</div>
                        }
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Add Product</label>
                                <Select onValueChange={addProduct}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Search product..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* @ts-ignore */}
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                                                {p.name} - ₹{p.selling_price}
                                                {p.stock_quantity === 0 ? " (Out)" : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                {orderItems.map((item, index) => (
                                    <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input
                                                    type="number"
                                                    className="h-7 w-16 text-xs"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const qty = parseInt(e.target.value) || 1;
                                                        const newItems = [...orderItems];
                                                        newItems[index].quantity = qty;
                                                        setValue("orderItems", newItems);
                                                    }}
                                                />
                                                <span className="text-xs text-muted-foreground">x</span>
                                                <Input
                                                    type="number"
                                                    className="h-7 w-20 text-xs"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => {
                                                        const price = parseFloat(e.target.value) || 0;
                                                        const newItems = [...orderItems];
                                                        newItems[index].unitPrice = price;
                                                        setValue("orderItems", newItems);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            ₹{(item.quantity * item.unitPrice).toFixed(0)}
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeProduct(index)} type="button">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {orderItems.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                                        No items added
                                    </div>
                                )}
                                {errors.orderItems && <p className="text-xs text-center text-red-500">{errors.orderItems.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Order Notes</label>
                                <Textarea {...register("notes")} placeholder="Any special instructions..." className="h-20" />
                            </div>
                        </div>
                    </CustomAccordionItem>
                </div>

                <div className="p-6 bg-background border-t mt-auto shadow-up z-10">
                    <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="text-lg font-bold">
                            ₹{orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                        </span>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isPending}
                        onClick={() => console.log("Submit Clicked")}
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {isPending ? "Creating Order..." : "Create Order"}
                    </Button>
                </div>
            </form>
        </>
    );
}

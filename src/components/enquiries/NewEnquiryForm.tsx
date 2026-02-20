"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, CalendarClock, Flag } from "lucide-react";
import Link from "next/link";

import { useCreateEnquiry } from "@/lib/react-query/hooks/useEnquiries";
import { useQueryClient } from "@tanstack/react-query";

import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function NewEnquiryForm() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { mutate: createEnquiry, isPending: isLoading } = useCreateEnquiry();

    // Check limits
    const { canCreateEnquiry, subscription } = usePlanLimits();
    const planName = subscription?.plan?.display_name || 'Free Plan';

    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [followUpNotes, setFollowUpNotes] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🛑 Limit Check Before Submit
        if (!canCreateEnquiry) {
            toast({
                title: "Limit Reached 🔒",
                description: `You've reached your enquiry limit on the ${planName}. Upgrade to continue!`,
                variant: "default",
                action: (
                    <Link
                        href="/settings/subscription"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                    >
                        Upgrade
                    </Link>
                ),
            });
            return;
        }

        // Speed Logic: Auto-generate name if empty
        let finalName = name;
        if (!finalName.trim()) {
            finalName = `Guest ${phone.slice(-4)}`;
        }

        const enquiryData: any = {
            phone,
            message,
            customer_name: finalName,
            priority,
        };

        if (followUpDate) {
            enquiryData.follow_up_date = new Date(followUpDate).toISOString();
        }
        if (followUpNotes) {
            enquiryData.follow_up_notes = followUpNotes;
        }

        createEnquiry(enquiryData, {
            onSuccess: () => {
                toast({
                    title: "✅ Enquiry Saved Successfully",
                    description: `Added enquiry from ${finalName}${followUpDate ? ' with follow-up scheduled' : ''}`,
                    duration: 4000,
                    className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
                });
                queryClient.invalidateQueries({ queryKey: ["enquiries"] });
                router.push("/enquiries");
                router.refresh();
            },
            onError: (error) => {
                if (error.message.toLowerCase().includes('limit')) {
                    toast({
                        title: "Limit Reached 🔒",
                        description: `You've reached your limits. Upgrade to add more!`,
                        action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
                    });
                } else {
                    toast({
                        title: "❌ Failed to Save",
                        description: error.message,
                        variant: "destructive",
                    });
                }
            }
        });
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/enquiries">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Enquiry</h1>
                    <p className="text-muted-foreground">Log a customer enquiry with smart follow-up tracking</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Enquiry Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Phone (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        setPhone(value);
                                        if (value.length > 0 && value.length !== 10) {
                                            setPhoneError("Enter only 10 numbers");
                                        } else {
                                            setPhoneError("");
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isLoading) {
                                        e.preventDefault();
                                        const form = e.currentTarget.form;
                                        if (form) form.requestSubmit();
                                    }
                                }}
                                placeholder="10-digit mobile number"
                                required
                                disabled={isLoading}
                                className={phoneError ? "border-red-500" : ""}
                            />
                            {phoneError && (
                                <p className="text-sm text-red-500">{phoneError}</p>
                            )}
                        </div>

                        {/* Message (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message / What are they looking for? *</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="E.g., Customer wants red kurta in size L, will decide next week."
                                rows={3}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 This description is used to auto-generate smart WhatsApp follow-up messages
                            </p>
                        </div>

                        {/* Name (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Leave blank to auto-generate"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Follow-Up Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                <CalendarClock className="h-4 w-4 text-orange-500" />
                                Follow-Up Scheduling
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Follow-up Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="follow_up_date">Follow-Up Date</Label>
                                    <Input
                                        id="follow_up_date"
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        <Flag className="h-3.5 w-3.5" />
                                        Priority
                                    </Label>
                                    <Select value={priority} onValueChange={(val) => setPriority(val as any)} disabled={isLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">🟢 Low</SelectItem>
                                            <SelectItem value="medium">🟡 Medium</SelectItem>
                                            <SelectItem value="high">🟠 High</SelectItem>
                                            <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Follow-up Notes */}
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="follow_up_notes">Follow-Up Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                <Textarea
                                    id="follow_up_notes"
                                    value={followUpNotes}
                                    onChange={(e) => setFollowUpNotes(e.target.value)}
                                    placeholder="E.g., Call back after payment confirmation, show new collection..."
                                    rows={2}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Enquiry
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

import { useCreateEnquiry } from "@/lib/react-query/hooks/useEnquiries";

export default function NewEnquiryForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { mutate: createEnquiry, isPending: isLoading } = useCreateEnquiry();

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Speed Logic: Auto-generate name if empty
        let finalName = name;
        if (!finalName.trim()) {
            finalName = `Guest ${phone.slice(-4)}`;
        }

        createEnquiry({
            phone,
            message,
            customer_name: finalName,
        }, {
            onSuccess: () => {
                toast({
                    title: "✅ Enquiry Saved Successfully",
                    description: `Added enquiry from ${finalName}`,
                    duration: 4000,
                    className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
                });
                router.push("/enquiries");
                router.refresh();
            },
            onError: (error) => {
                toast({
                    title: "❌ Failed to Save",
                    description: error.message,
                    variant: "destructive",
                });
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
                    <p className="text-muted-foreground">Quickly log a new customer question</p>
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
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="10-digit mobile number"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Message (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message / Question *</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="What is the customer asking?"
                                rows={3}
                                required
                                disabled={isLoading}
                            />
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Trash2, CalendarClock, Flag, Phone as PhoneIcon } from "lucide-react";
import Link from "next/link";
import { useEnquiry, useUpdateEnquiry, useDeleteEnquiry, useLogFollowUpActivity } from "@/lib/react-query/hooks/useEnquiries";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WhatsAppEnquiryMessage } from "./WhatsAppEnquiryMessage";
import { FollowUpTimeline } from "./FollowUpTimeline";
import { createClient } from "@/lib/supabase/client";

export default function EditEnquiryForm({ id }: { id: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries & Mutations
    const { data: enquiry, isLoading: isFetching } = useEnquiry(id);
    const { mutate: updateEnquiry, isPending: isUpdating } = useUpdateEnquiry();
    const { mutate: deleteEnquiry, isPending: isDeleting } = useDeleteEnquiry();
    const { mutate: logActivity } = useLogFollowUpActivity();

    // Business name for WhatsApp
    const [businessName, setBusinessName] = useState("Our Store");

    // Form State
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("new");
    const [followUpDate, setFollowUpDate] = useState("");
    const [followUpNotes, setFollowUpNotes] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

    // Fetch business name
    useEffect(() => {
        async function fetchBusinessName() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("business_name")
                    .eq("id", user.id)
                    .single();
                if (profile?.business_name) setBusinessName(profile.business_name);
            }
        }
        fetchBusinessName();
    }, []);

    // Sync data when fetched
    useEffect(() => {
        if (enquiry) {
            setPhone(enquiry.phone);
            setName(enquiry.customer_name);
            setMessage(enquiry.message);
            setStatus(enquiry.status);
            setFollowUpNotes(enquiry.follow_up_notes || "");
            setPriority(enquiry.priority || "medium");
            if (enquiry.follow_up_date) {
                setFollowUpDate(new Date(enquiry.follow_up_date).toISOString().split("T")[0]);
            }
        }
    }, [enquiry]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!enquiry) return;

        const updateData: any = {
            id: enquiry.id,
            customer_name: name,
            phone,
            message,
            status: status as "new" | "needs_follow_up" | "converted" | "dropped",
            priority,
            follow_up_notes: followUpNotes || null,
        };

        if (followUpDate) {
            updateData.follow_up_date = new Date(followUpDate).toISOString();
        } else {
            updateData.follow_up_date = null;
        }

        updateEnquiry(updateData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["enquiries"] });
                toast({ title: "Enquiry Updated ✅", description: "All changes saved successfully." });
                router.push("/enquiries");
                router.refresh();
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    const handleAddNote = () => {
        if (!followUpNotes.trim()) return;
        logActivity({
            enquiryId: id,
            action: "note_added",
            note: followUpNotes,
        }, {
            onSuccess: () => {
                toast({ title: "📝 Note Logged", description: "Added to activity timeline." });
            }
        });
    };

    const handleLogCall = () => {
        logActivity({
            enquiryId: id,
            action: "called",
            note: `Phone call with ${name || "customer"}`,
        }, {
            onSuccess: () => {
                toast({ title: "📞 Call Logged", description: "Phone call recorded in timeline." });
            }
        });
    };

    const handleDelete = () => {
        deleteEnquiry(id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["enquiries"] });
                toast({ title: "Enquiry Deleted", description: "Enquiry moved to trash." });
                router.push("/enquiries");
                router.refresh();
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    if (isFetching) {
        return <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (!enquiry) {
        return <div className="text-center py-10">Enquiry not found</div>;
    }

    const isLoading = isUpdating || isDeleting;
    const isClosed = enquiry.status === "converted" || enquiry.status === "dropped";

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/enquiries">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Edit Enquiry</h1>
                    <p className="text-muted-foreground">Manage details, follow-ups, and WhatsApp messages</p>
                </div>
            </div>

            {/* WhatsApp CRM Section */}
            {!isClosed && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Smart WhatsApp Follow-Up
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <WhatsAppEnquiryMessage
                            enquiryId={id}
                            customerName={name}
                            customerPhone={phone}
                            enquiryMessage={message}
                            businessName={businessName}
                            followUpDate={enquiry.follow_up_date}
                            followUpCount={enquiry.follow_up_count}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleLogCall} className="text-xs">
                                <PhoneIcon className="h-3 w-3 mr-1" /> Log Call
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleAddNote} className="text-xs" disabled={!followUpNotes.trim()}>
                                📝 Save Note to Timeline
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Enquiry Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {status !== "converted" && <SelectItem value="new">New</SelectItem>}
                                    {status !== "converted" && <SelectItem value="needs_follow_up">Mark as Contacted</SelectItem>}
                                    {status === "converted" && <SelectItem value="converted">Converted</SelectItem>}
                                    <SelectItem value="dropped">Close Enquiry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
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
                                placeholder="10-digit mobile number"
                                required
                                disabled={isLoading}
                                className={phoneError ? "border-red-500" : ""}
                            />
                            {phoneError && (
                                <p className="text-sm text-red-500">{phoneError}</p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message / What are they looking for?</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 This description powers the smart WhatsApp message templates above
                            </p>
                        </div>

                        {/* Follow-Up Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                <CalendarClock className="h-4 w-4 text-orange-500" />
                                Follow-Up Scheduling
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="follow_up_date">Follow-Up Date</Label>
                                    <Input
                                        id="follow_up_date"
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

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

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="follow_up_notes">Follow-Up Notes</Label>
                                <Textarea
                                    id="follow_up_notes"
                                    value={followUpNotes}
                                    onChange={(e) => setFollowUpNotes(e.target.value)}
                                    placeholder="E.g., Call back after payment, show new collection..."
                                    rows={2}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" disabled={isLoading}>
                                    <Trash2 className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will delete the enquiry permanently.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex gap-2">
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
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>

            {/* Activity Timeline */}
            <FollowUpTimeline enquiryId={id} />
        </div>
    );
}

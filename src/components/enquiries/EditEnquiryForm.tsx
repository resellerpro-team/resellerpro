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
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEnquiry, useUpdateEnquiry, useDeleteEnquiry } from "@/lib/react-query/hooks/useEnquiries";
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

export default function EditEnquiryForm({ id }: { id: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries & Mutations
    const { data: enquiry, isLoading: isFetching } = useEnquiry(id);
    const { mutate: updateEnquiry, isPending: isUpdating } = useUpdateEnquiry();
    const { mutate: deleteEnquiry, isPending: isDeleting } = useDeleteEnquiry();

    // Form State
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("new");

    // Sync data when fetched
    useEffect(() => {
        if (enquiry) {
            setPhone(enquiry.phone);
            setName(enquiry.customer_name);
            setMessage(enquiry.message);
            setStatus(enquiry.status);
        }
    }, [enquiry]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!enquiry) return;

        updateEnquiry({
            id: enquiry.id,
            customer_name: name,
            phone,
            message,
            status: status as "new" | "needs_follow_up" | "converted" | "dropped",
        }, {
            onSuccess: () => {
                // Invalidate enquiries query
                queryClient.invalidateQueries({ queryKey: ["enquiries"] });
                
                toast({ title: "Enquiry Updated", description: "Changes saved successfully." });
                router.push("/enquiries");
                router.refresh();
            },
            onError: (err) => {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };

    const handleDelete = () => {
        deleteEnquiry(id, {
            onSuccess: () => {
                // Invalidate enquiries query
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

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/enquiries">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Enquiry</h1>
                    <p className="text-muted-foreground">Update customer details and status</p>
                </div>
            </div>

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
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                disabled={isLoading}
                            />
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
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                required
                                disabled={isLoading}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" disabled={isLoading}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
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
        </div>
    );
}

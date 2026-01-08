import EditEnquiryForm from "@/components/enquiries/EditEnquiryForm";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function EditEnquiryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditEnquiryForm id={id} />
        </Suspense>
    );
}

import NewEnquiryForm from "@/components/enquiries/NewEnquiryForm";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function NewEnquiryPage() {
    return (
        <Suspense>
            <NewEnquiryForm />
        </Suspense>
    );
}

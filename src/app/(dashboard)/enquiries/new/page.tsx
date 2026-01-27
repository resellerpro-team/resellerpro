import NewEnquiryForm from "@/components/enquiries/NewEnquiryForm";
import { RequireVerification } from "@/components/shared/RequireVerification";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function NewEnquiryPage() {
    return (
        <RequireVerification autoOpen={true}>
            <Suspense>
                <NewEnquiryForm />
            </Suspense>
        </RequireVerification>
    );
}

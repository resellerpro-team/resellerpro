import { EnquiriesClient } from "@/components/enquiries/EnquiriesClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function EnquiriesPage() {
    return (
        <Suspense>
            <EnquiriesClient />
        </Suspense>
    );
}

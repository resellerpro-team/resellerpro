import { CustomersClient } from "@/components/customers/CustomersClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersClient />
    </Suspense>
  );
}

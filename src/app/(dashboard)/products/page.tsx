import { ProductsClient } from "./ProductsClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsClient />
    </Suspense>
  );
}

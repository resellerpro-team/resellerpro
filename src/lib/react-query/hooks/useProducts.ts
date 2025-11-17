"use client";

import { useQuery } from "@tanstack/react-query";

export function useProducts(queryString: string) {
  return useQuery({
    queryKey: ["products", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

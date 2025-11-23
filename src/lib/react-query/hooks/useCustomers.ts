"use client";

import { useQuery } from "@tanstack/react-query";

export function useCustomers(queryString: string) {
  return useQuery({
    queryKey: ["customers", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/customers?${queryString}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }

      return res.json();
    },
  });
}

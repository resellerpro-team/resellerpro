"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function fetchCustomers(queryString: string) {
  const res = await fetch(`/api/customers?${queryString}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch customers");
  }

  return res.json();
}

export function useCustomers(queryString: string) {
  return useQuery({
    queryKey: ["customers", queryString],
    queryFn: () => fetchCustomers(queryString),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
}

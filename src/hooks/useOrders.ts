import { useMutation, useQuery } from "@tanstack/react-query";
import { orderQueries } from "@/lib/supabase/orders";
import type { OrderSubmissionInsert } from "@/lib/supabase/orders";

export function useOrders({
  page = 1,
  status,
}: {
  page?: number;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ["orders", { page, status }],
    queryFn: () => orderQueries.getOrders({ page, status }),
    staleTime: 1000 * 60 * 1, // Consider data fresh for 1 minute as orders need frequent updates
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderQueries.getOrderById(id),
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (order: OrderSubmissionInsert) =>
      orderQueries.createOrderSubmission(order),
  });
}

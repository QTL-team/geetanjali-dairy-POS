import React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/services/order.service";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "PREPARING":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Preparing</Badge>;
    case "READY":
      return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Ready</Badge>;
    case "OUT_FOR_DELIVERY":
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Out for Delivery</Badge>;
    case "DELIVERED":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

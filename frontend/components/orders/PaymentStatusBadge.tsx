import React from "react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/services/order.service";

interface PaymentStatusBadgeProps {
  status?: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
    case "PARTIAL":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Partial</Badge>;
    case "PAID":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    default:
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>; // Default to pending
  }
}

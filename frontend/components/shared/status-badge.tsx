import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatusType =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAID"
  | "PARTIAL"
  | "DRAFT";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "DELIVERED":
      case "PAID":
      case "READY":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "OUT_FOR_DELIVERY":
      case "PREPARING":
      case "PARTIAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "PENDING":
      case "DRAFT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "CANCELLED":
        return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: StatusType) => {
    return status.replace(/_/g, " ");
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", getStatusColor(status), className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

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
  | "DRAFT"
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

interface StatusBadgeProps {
  status?: StatusType | string;
  className?: string;
  dot?: boolean;
  children?: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "primary" | "default";
}

export function StatusBadge({ status, className, dot, children, variant }: StatusBadgeProps) {
  const getStatusColorInfo = (statusStr?: string, variantOverride?: string) => {
    // If explicit variant is provided, use it to dictate colors
    if (variantOverride) {
      switch (variantOverride) {
        case "success": return { bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" };
        case "warning": return { bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500" };
        case "danger": return { bg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20", dot: "bg-rose-500" };
        case "primary": return { bg: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" };
        case "neutral": default: return { bg: "bg-muted text-muted-foreground border-border", dot: "bg-slate-500" };
      }
    }
    
    // Otherwise infer from status string
    switch (statusStr) {
      case "DELIVERED":
      case "PAID":
      case "READY":
      case "IN_STOCK":
        return { bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" };
      case "OUT_FOR_DELIVERY":
      case "PREPARING":
      case "PARTIAL":
        return { bg: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500" };
      case "PENDING":
      case "DRAFT":
      case "LOW_STOCK":
        return { bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500" };
      case "CANCELLED":
      case "OUT_OF_STOCK":
        return { bg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20", dot: "bg-rose-500" };
      default:
        return { bg: "bg-muted text-muted-foreground border-border", dot: "bg-slate-500" };
    }
  };

  const getStatusLabel = (statusStr?: string) => {
    if (!statusStr) return "";
    return statusStr.replace(/_/g, " ");
  };

  const colorInfo = getStatusColorInfo(status as string, variant);

  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize border inline-flex items-center gap-1.5 px-2.5 py-0.5", colorInfo.bg, className)}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-20", colorInfo.dot)} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", colorInfo.dot)} />
        </span>
      )}
      {children || getStatusLabel(status as string)}
    </Badge>
  );
}

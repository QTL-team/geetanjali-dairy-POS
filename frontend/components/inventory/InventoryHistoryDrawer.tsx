"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { InventorySummary, getInventoryHistory } from "@/services/inventory.service";

interface InventoryHistoryDrawerProps {
  product: InventorySummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryHistoryDrawer({ product, open, onOpenChange }: InventoryHistoryDrawerProps) {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["inventory-history", product?.id],
    queryFn: () => getInventoryHistory(product!.id),
    enabled: !!product && open,
  });

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stock History</DialogTitle>
          <DialogDescription>
            Recent stock movements for <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive bg-destructive/10 rounded-md">
              Failed to load history.
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center border rounded-md bg-muted/20">
              <Package className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No stock history found.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />
                
                {history.map((item) => {
                  let Icon = Package;
                  let iconBg = "bg-muted";
                  let iconColor = "text-muted-foreground";
                  let sign = "";
                  
                  if (item.type === 'ADD') {
                    Icon = ArrowDownLeft;
                    iconBg = "bg-emerald-100 dark:bg-emerald-900/30";
                    iconColor = "text-emerald-600 dark:text-emerald-400";
                    sign = "+";
                  } else if (item.type === 'RESERVE') {
                    Icon = ArrowUpRight;
                    iconBg = "bg-amber-100 dark:bg-amber-900/30";
                    iconColor = "text-amber-600 dark:text-amber-400";
                    sign = "-";
                  } else if (item.type === 'RETURN') {
                    Icon = ArrowRightLeft;
                    iconBg = "bg-blue-100 dark:bg-blue-900/30";
                    iconColor = "text-blue-600 dark:text-blue-400";
                    sign = "+";
                  }

                  return (
                    <div key={item.id} className="flex gap-4 relative z-10">
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconBg} shadow-sm`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="flex flex-1 flex-col pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {item.type === 'ADD' ? 'Stock Added' : 
                               item.type === 'RESERVE' ? 'Stock Reserved' : 
                               item.type === 'RETURN' ? 'Stock Returned' : 'Adjustment'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <div className={`font-semibold ${
                            item.type === 'ADD' || item.type === 'RETURN' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {sign}{item.quantity} {product.unit}
                          </div>
                        </div>
                        {item.remarks && (
                          <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md">
                            {item.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

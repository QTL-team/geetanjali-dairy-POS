"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPayment } from "@/services/payment.service";

interface PaymentDialogProps {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ paymentId, open, onOpenChange }: PaymentDialogProps) {
  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => getPayment(paymentId!),
    enabled: !!paymentId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        {isLoading || !payment ? (
          <div className="flex flex-col gap-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-emerald-600">₹{payment.amount}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Received on {format(new Date(payment.paidAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <Badge variant="outline" className="text-base py-1">
                {payment.method}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Customer:</h3>
                <p className="font-medium">{payment.invoice.order.customer.name}</p>
                <p className="text-sm">{payment.invoice.order.customer.phone}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Invoice Ref:</h3>
                <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">Order: {payment.invoice.order.orderNumber}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 bg-muted/50 font-medium w-1/3">Payment Type</td>
                    <td className="px-4 py-3">{payment.paymentType}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 bg-muted/50 font-medium">Method</td>
                    <td className="px-4 py-3">{payment.method}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-muted/50 font-medium">Notes</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.notes || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getInvoice } from "@/services/invoice.service";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDialog({ invoiceId, open, onOpenChange }: InvoiceDialogProps) {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoice(invoiceId!),
    enabled: !!invoiceId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        {isLoading || !invoice ? (
          <div className="flex flex-col gap-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  Generated on {format(new Date(invoice.generatedAt), "MMM d, yyyy")}
                </p>
              </div>
              <Badge 
                variant={
                  invoice.status === "PAID" ? "default" :
                  invoice.status === "PARTIAL" ? "secondary" :
                  invoice.status === "SENT" ? "outline" : "destructive"
                }
              >
                {invoice.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Bill To:</h3>
                <p className="font-medium">{invoice.order.customer.name}</p>
                <p className="text-sm">{invoice.order.customer.phone}</p>
                {invoice.order.customer.address && (
                  <p className="text-sm text-muted-foreground">{invoice.order.customer.address}</p>
                )}
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Order Ref:</h3>
                <p className="font-medium">{invoice.order.orderNumber}</p>
              </div>
            </div>

            {/* Itemized Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-right font-medium">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Price</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.product.name}</div>
                          {item.product.gujaratiName && (
                            <div className="text-xs text-muted-foreground font-gujarati">{item.product.gujaratiName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity} {item.product.unit}</td>
                        <td className="px-4 py-3 text-right">₹{item.unitPrice}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/50 font-medium">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">Total Amount</td>
                      <td className="px-4 py-3 text-right">₹{invoice.amount}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground">Paid Amount</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">₹{invoice.paidAmount}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-lg">Balance Due</td>
                      <td className="px-4 py-3 text-right text-lg text-destructive">₹{invoice.balanceAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Date</th>
                        <th className="px-4 py-2 text-left font-medium">Method</th>
                        <th className="px-4 py-2 text-right font-medium">Amount</th>
                        <th className="px-4 py-2 text-left font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.payments.map((payment) => (
                        <tr key={payment.id} className="border-t">
                          <td className="px-4 py-3">{format(new Date(payment.paidAt), "MMM d, yyyy HH:mm")}</td>
                          <td className="px-4 py-3">{payment.method}</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-600">₹{payment.amount}</td>
                          <td className="px-4 py-3 text-muted-foreground">{payment.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

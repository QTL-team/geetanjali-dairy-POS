import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order, getOrderReturns } from "@/services/order.service";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RecordReturnDialog } from "./RecordReturnDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewOrderDialog({ order, open, onOpenChange }: ViewOrderDialogProps) {
  const [isRecordReturnOpen, setIsRecordReturnOpen] = useState(false);

  const { data: returns } = useQuery({
    queryKey: ["order-returns", order?.id],
    queryFn: () => getOrderReturns(order!.id),
    enabled: !!order && open,
  });

  if (!order) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-3xl w-[90vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b pb-4 shrink-0 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</DialogTitle>
                <DialogDescription>
                  Created on {new Date(order.createdAt).toLocaleDateString()}
                </DialogDescription>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6 grid gap-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground tracking-tight">Customer Details</h3>
                  <div className="grid grid-cols-1 gap-1 text-sm bg-muted/10 p-4 rounded-lg border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Name</span>
                      <span className="font-semibold">{order.customer?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground font-medium">Phone</span>
                      <span>{order.contactNumber || order.customer?.phone || "-"}</span>
                    </div>
                    <div className="flex flex-col mt-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground font-medium mb-1">Address</span>
                      <span>{order.deliveryAddress || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground tracking-tight">Order Info</h3>
                  <div className="grid grid-cols-1 gap-1 text-sm bg-muted/10 p-4 rounded-lg border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Delivery Date</span>
                      <span className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col mt-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground font-medium mb-1">Notes</span>
                      <span>{order.notes || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground tracking-tight">Slip Statuses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-muted/10 p-4 rounded-lg border border-border/50 flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground font-medium">Worker Slip</span>
                    {order.workerSlipPrinted ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Printed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                    )}
                  </div>
                  <div className="bg-muted/10 p-4 rounded-lg border border-border/50 flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground font-medium">Delivery Slip</span>
                    {order.deliverySlipPrinted ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Generated</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                    )}
                  </div>
                  <div className="bg-muted/10 p-4 rounded-lg border border-border/50 flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground font-medium">Bill</span>
                    {order.invoice ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Generated</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground tracking-tight">Order Items</h3>
                <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Ord.</TableHead>
                        <TableHead className="text-right text-red-600">Ret.</TableHead>
                        <TableHead className="text-right text-green-600">Billed</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => {
                        const billedQty = item.billedQuantity ?? item.quantity;
                        const retQty = item.returnedQuantity ?? 0;
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/10">
                            <TableCell className="font-medium whitespace-nowrap">
                              {item.product?.name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right text-red-600 font-medium">{retQty > 0 ? retQty : "-"}</TableCell>
                            <TableCell className="text-right text-green-600 font-medium">{billedQty}</TableCell>
                            <TableCell className="text-right">₹{(item.unitPrice || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-semibold">₹{(billedQty * (item.unitPrice || 0)).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {returns && returns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground tracking-tight">Return History</h3>
                  <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returns.map((ret) => (
                          <TableRow key={ret.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(ret.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{ret.orderItem?.product?.name}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">{ret.returnedQuantity}</TableCell>
                            <TableCell className="text-muted-foreground">{ret.remarks || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-background shrink-0 z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-lg text-muted-foreground">Grand Total</span>
              <span className="font-bold text-3xl text-primary tracking-tight">₹{(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsRecordReturnOpen(true)} 
                disabled={order.status === 'CANCELLED'}
                className="w-full sm:w-1/2"
              >
                Record Return
              </Button>
              <Button onClick={() => onOpenChange(false)} className="w-full sm:w-1/2">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isRecordReturnOpen && (
        <RecordReturnDialog 
          order={order}
          open={isRecordReturnOpen}
          onOpenChange={setIsRecordReturnOpen}
        />
      )}
    </>
  );
}

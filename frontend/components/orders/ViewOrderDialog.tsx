import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order, getOrderReturns } from "@/services/order.service";
import { StatusBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RecordReturnDialog } from "./RecordReturnDialog";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between mt-4">
            <div>
              <DialogTitle className="text-2xl font-bold">Order #{order.orderNumber}</DialogTitle>
              <DialogDescription>
                Created on {new Date(order.createdAt).toLocaleDateString()}
              </DialogDescription>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Customer Details</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Name:</span>
              <span className="col-span-2">{order.customer?.name || "Unknown"}</span>
              
              <span className="text-muted-foreground font-medium">Phone:</span>
              <span className="col-span-2">{order.contactNumber || order.customer?.phone || "-"}</span>
              
              <span className="text-muted-foreground font-medium">Address:</span>
              <span className="col-span-2">{order.deliveryAddress || "-"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Order Info</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Delivery Date:</span>
              <span className="col-span-2">{new Date(order.deliveryDate).toLocaleDateString()}</span>
              
              <span className="text-muted-foreground font-medium">Notes:</span>
              <span className="col-span-2">{order.notes || "-"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Order Items</h3>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ord. Qty</TableHead>
                  <TableHead className="text-right text-red-600">Returned</TableHead>
                  <TableHead className="text-right text-green-600">Billed</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const billedQty = item.billedQuantity ?? item.quantity;
                  const retQty = item.returnedQuantity ?? 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{retQty > 0 ? retQty : "-"}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{billedQty}</TableCell>
                      <TableCell className="text-right">₹{(item.unitPrice || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">₹{(billedQty * (item.unitPrice || 0)).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {returns && returns.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Return History</h3>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Returned Qty</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell>{new Date(ret.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{ret.orderItem?.product?.name}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{ret.returnedQuantity}</TableCell>
                      <TableCell>{ret.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={() => setIsRecordReturnOpen(true)} disabled={order.status === 'CANCELLED'}>
            Record Return
          </Button>
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 min-w-[250px] flex justify-between items-center">
            <span className="font-semibold text-lg">Grand Total:</span>
            <span className="font-bold text-2xl text-primary">₹{(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {isRecordReturnOpen && (
        <RecordReturnDialog 
          order={order}
          open={isRecordReturnOpen}
          onOpenChange={setIsRecordReturnOpen}
        />
      )}
    </Dialog>
  );
}

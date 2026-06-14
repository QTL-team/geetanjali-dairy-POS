import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/services/order.service";
import { StatusBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ViewOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewOrderDialog({ order, open, onOpenChange }: ViewOrderDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
          <div className="border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product?.name || "Unknown Product"}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{(item.unitPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 min-w-[250px] flex justify-between items-center">
            <span className="font-semibold text-lg">Grand Total:</span>
            <span className="font-bold text-2xl text-primary">₹{(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

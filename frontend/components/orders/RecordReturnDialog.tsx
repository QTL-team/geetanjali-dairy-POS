import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Order, recordOrderReturn } from "@/services/order.service";

interface RecordReturnDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordReturnDialog({ order, open, onOpenChange }: RecordReturnDialogProps) {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  // Only items that can still be returned
  const availableItems = order.items.filter((item) => {
    const returned = item.returnedQuantity ?? 0;
    return item.quantity - returned > 0;
  });

  const selectedItem = availableItems.find(i => i.id === selectedItemId);
  const maxReturnable = selectedItem ? (selectedItem.quantity - (selectedItem.returnedQuantity ?? 0)) : 0;

  const returnMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItemId) throw new Error("Please select a product");
      const numQty = parseFloat(quantity);
      if (isNaN(numQty) || numQty <= 0) throw new Error("Please enter a valid quantity");
      if (numQty > maxReturnable) throw new Error(`Cannot return more than ${maxReturnable}`);
      
      return recordOrderReturn(order.id, {
        orderItemId: selectedItemId,
        returnedQuantity: numQty,
        remarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-returns", order.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sales-report"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-balances"] });
      queryClient.invalidateQueries({ queryKey: ["return-metrics"] });
      toast.success("Return recorded successfully");
      onOpenChange(false);
      setSelectedItemId("");
      setQuantity("");
      setRemarks("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to record return");
    }
  });

  const handleSave = () => {
    returnMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Product Return</DialogTitle>
          <DialogDescription>
            Record returned products for order {order.orderNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedItemId} onValueChange={(val) => setSelectedItemId(val || "")}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">No returnable items</div>
                ) : (
                  availableItems.map((item) => {
                    const retQty = item.returnedQuantity ?? 0;
                    const remQty = item.quantity - retQty;
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.product?.name} (Max: {remQty})
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity">Returned Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              min="0"
              max={maxReturnable}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedItemId}
            />
            {selectedItem && (
              <p className="text-xs text-muted-foreground">
                You can return up to {maxReturnable} units.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Reason for return..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={returnMutation.isPending || !selectedItemId || !quantity}>
            {returnMutation.isPending ? "Recording..." : "Save Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

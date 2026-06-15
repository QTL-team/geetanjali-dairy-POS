"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, recordOrderPayment } from "@/services/order.service";

interface RecordPaymentDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ order, open, onOpenChange }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState<string>("");

  const paymentMutation = useMutation({
    mutationFn: () => recordOrderPayment(order!.id, parseFloat(amount), method, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment recorded successfully");
      onOpenChange(false);
      setAmount("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  });

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const balanceAmount = order!.invoice?.balanceAmount ?? order!.totalAmount;
    if (parseFloat(amount) > balanceAmount) {
      toast.error("Amount cannot be greater than the pending amount");
      return;
    }
    
    paymentMutation.mutate();
  };

  if (!order) return null;

  const totalAmount = order.invoice?.amount ?? order.totalAmount;
  const paidAmount = order.invoice?.paidAmount ?? 0;
  const balanceAmount = order.invoice?.balanceAmount ?? order.totalAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment for order {order.orderNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Total Order Amount</Label>
            <div className="text-xl font-bold">₹{totalAmount.toFixed(2)}</div>
          </div>

          {paidAmount > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Already Paid</Label>
                <div className="text-lg font-semibold text-green-600">₹{paidAmount.toFixed(2)}</div>
              </div>
              <div className="grid gap-2">
                <Label>Pending Amount</Label>
                <div className="text-lg font-semibold text-red-600">₹{balanceAmount.toFixed(2)}</div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount Paying Now</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              max={balanceAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 w-max"
              onClick={() => setAmount(balanceAmount.toString())}
            >
              Fill Pending Amount
            </Button>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={(val) => { if (val) setMethod(val) }}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g. Transaction ID"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={paymentMutation.isPending}>
            {paymentMutation.isPending ? "Saving..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

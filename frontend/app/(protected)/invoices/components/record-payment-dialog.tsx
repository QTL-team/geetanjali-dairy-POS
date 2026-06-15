"use client";

import * as React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recordPayment, InvoiceSummary } from "@/services/invoice.service";

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.string().min(1, "Method is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  invoice: InvoiceSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ invoice, open, onOpenChange }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: invoice?.balanceAmount || 0,
      method: "UPI",
      notes: "",
    },
  });

  // Update default amount when invoice changes
  React.useEffect(() => {
    if (invoice) {
      form.reset({
        amount: invoice.balanceAmount,
        method: "UPI",
        notes: "",
      });
    }
  }, [invoice, form]);

  const { mutate: submitPayment, isPending } = useMutation({
    mutationFn: (data: PaymentFormValues) => recordPayment(invoice!.id, data),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice?.id] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  function onSubmit(data: PaymentFormValues) {
    if (data.amount > (invoice?.balanceAmount || 0)) {
      form.setError("amount", { message: "Amount exceeds balance due" });
      return;
    }
    submitPayment(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment for {invoice?.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance due: ₹{invoice?.balanceAmount}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. UPI, Cash, Bank Transfer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction ID, remarks, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventorySummary, addStock, reserveStock, returnStock } from "@/services/inventory.service";

const adjustStockSchema = z.object({
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  notes: z.string().optional(),
});

type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

interface AdjustStockDialogProps {
  product: InventorySummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustStockDialog({ product, open, onOpenChange }: AdjustStockDialogProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"ADD" | "RESERVE" | "RETURN">("ADD");

  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      quantity: 0,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: AdjustStockFormValues) => {
      if (!product) throw new Error("No product selected");
      
      if (tab === "ADD") {
        return addStock(product.id, values.quantity, values.notes);
      } else if (tab === "RESERVE") {
        return reserveStock(product.id, values.quantity, values.notes);
      } else if (tab === "RETURN") {
        return returnStock(product.id, values.quantity, values.notes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      toast.success("Stock adjusted successfully");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to adjust stock");
    }
  });

  const onSubmit = (values: AdjustStockFormValues) => {
    mutation.mutate(values);
  };

  // Reset form when modal opens
  if (open && form.formState.isSubmitSuccessful) {
    form.reset();
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust inventory for <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="ADD" 
          value={tab} 
          onValueChange={(v) => setTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="ADD">Add</TabsTrigger>
            <TabsTrigger value="RESERVE">Reserve</TabsTrigger>
            <TabsTrigger value="RETURN">Return</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity ({product.unit})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
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
                      <Input placeholder="Reason for adjustment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Adjustment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

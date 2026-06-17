"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getProducts, Product } from "@/services/product.service";
import { createOrder, CreateOrderPayload } from "@/services/order.service";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.any().transform(Number),
  unitPrice: z.any().transform(Number),
});

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one product is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderSheet({ open, onOpenChange }: CreateOrderSheetProps) {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      deliveryAddress: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create order");
    },
  });

  // Watch items for live calculation
  const watchedItems = form.watch("items");

  const grandTotal = useMemo(() => {
    return watchedItems.reduce((total, item) => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return total + lineTotal;
    }, 0);
  }, [watchedItems]);

  const onSubmit = (data: FormValues) => {
    const payload: CreateOrderPayload = {
      customerName: data.customerName,
      contactNumber: data.phoneNumber,
      deliveryAddress: data.deliveryAddress || "",
      deliveryDate: data.deliveryDate,
      notes: data.notes || "",
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))
    };
    createMutation.mutate(payload);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.sellingPrice);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Quickly create a new order without requiring a pre-registered customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...form.register("customerName")} placeholder="John Doe" />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="9876543210" />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea id="deliveryAddress" {...form.register("deliveryAddress")} placeholder="123 Main St, Area" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input id="deliveryDate" type="date" {...form.register("deliveryDate")} />
              {form.formState.errors.deliveryDate && (
                <p className="text-sm text-red-500">{form.formState.errors.deliveryDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...form.register("notes")} placeholder="Special instructions" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Products</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
            
            {form.formState.errors.items?.root && (
              <p className="text-sm text-red-500">{form.formState.errors.items.root.message}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentProduct = form.watch(`items.${index}.productId`);
                const productDetail = products.find(p => p.id === currentProduct);
                const unit = productDetail?.unit || "";
                const qty = form.watch(`items.${index}.quantity`) || 0;
                const price = form.watch(`items.${index}.unitPrice`) || 0;
                const lineTotal = qty * price;

                return (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 items-center bg-muted/30 p-3 sm:p-2 rounded-lg border">
                    <div className="sm:col-span-5">
                      <Select
                        value={currentProduct}
                        onValueChange={(val) => {
                          if (val) {
                            form.setValue(`items.${index}.productId`, val);
                            handleProductSelect(index, val);
                          }
                        }}
                      >
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue placeholder="Select...">
                            {products.find(p => p.id === currentProduct)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.items?.[index]?.productId && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.items[index]?.productId?.message}</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3 relative flex items-center">
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Qty" 
                        {...form.register(`items.${index}.quantity`)} 
                        className={`h-11 sm:h-10 ${unit ? "pr-12" : ""}`}
                      />
                      {unit && (
                        <span className="absolute right-3 text-xs text-muted-foreground font-medium lowercase">
                          {unit}
                        </span>
                      )}
                    </div>
                    
                    <div className="sm:col-span-3 flex justify-between sm:block text-right">
                      <span className="sm:hidden text-sm font-medium text-muted-foreground">Amount:</span>
                      <div>
                        <p className="text-sm font-medium">₹{lineTotal.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">@ ₹{price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-right flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-11 w-11 sm:h-10 sm:w-10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/10">
            <span className="font-semibold text-lg">Grand Total:</span>
            <span className="font-bold text-2xl text-primary">₹{grandTotal.toFixed(2)}</span>
          </div>

          <DialogFooter className="mt-8 pb-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

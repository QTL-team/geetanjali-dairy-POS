"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar as CalendarIcon,
  ShoppingBag,
  IndianRupee,
  CreditCard,
  FileText
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { CustomerStats, getCustomerDetails } from "@/services/customer.service";
import Link from "next/link";

interface CustomerDialogProps {
  customer: CustomerStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDialog({ customer, open, onOpenChange }: CustomerDialogProps) {
  const { data: details, isLoading } = useQuery({
    queryKey: ["customer-details", customer?.id],
    queryFn: () => getCustomerDetails(customer!.id),
    enabled: !!customer?.id && open,
  });

  if (!customer) return null;

  const handleWhatsApp = () => {
    const url = `https://wa.me/91${customer.phone}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold">{customer.name}</DialogTitle>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${customer.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = `/orders?customerId=${customer.id}`}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              View All Orders
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders History</TabsTrigger>
              <TabsTrigger value="financials">Invoices & Payments</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 pt-2">
              {isLoading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="h-24 bg-muted rounded-lg" />
                  <div className="h-64 bg-muted rounded-lg" />
                </div>
              ) : details ? (
                <>
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Phone className="h-4 w-4 mr-2" /> Phone
                        </div>
                        <div className="font-medium">{details.phone}</div>
                      </div>
                      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-2" /> Address
                        </div>
                        <div className="font-medium">{details.address || "No address provided"}</div>
                      </div>
                      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2" /> Member Since
                        </div>
                        <div className="font-medium">{format(new Date(details.createdAt), "MMMM d, yyyy")}</div>
                      </div>
                      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <IndianRupee className="h-4 w-4 mr-2" /> Total Outstanding
                        </div>
                        <div className={`font-bold ${customer.pendingAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>
                          ₹{customer.pendingAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {details.notes && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Customer Notes</h4>
                        <p className="text-sm">{details.notes}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-0">
                    {details.orders.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground border rounded-lg">
                        No orders found for this customer.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {details.orders.map((order) => (
                          <div key={order.id} className="p-4 border rounded-lg flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <div className="font-medium flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                {order.orderNumber}
                              </div>
                              <Badge variant="outline">{order.status}</Badge>
                            </div>
                            <div className="flex justify-between items-end text-sm text-muted-foreground">
                              <div>
                                Delivered: {format(new Date(order.deliveryDate), "MMM d, yyyy")}
                              </div>
                              <div className="font-semibold text-foreground">
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="text-xs bg-muted/50 p-2 rounded flex flex-wrap gap-2">
                              {order.items.map(item => (
                                <span key={item.id} className="bg-background px-2 py-1 rounded border">
                                  {item.product.name} x {item.quantity} {item.product.unit.toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="financials" className="mt-0">
                    <div className="space-y-6">
                      {details.orders.filter(o => o.invoice).length === 0 ? (
                         <div className="text-center py-10 text-muted-foreground border rounded-lg">
                           No invoices generated for this customer.
                         </div>
                      ) : (
                        details.orders.filter(o => o.invoice).map((order) => {
                          const invoice = order.invoice!;
                          return (
                            <div key={invoice.id} className="p-4 border rounded-lg space-y-4">
                              <div className="flex justify-between items-center pb-3 border-b">
                                <div className="flex items-center gap-2 font-medium">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  {invoice.invoiceNumber}
                                </div>
                                <Badge variant={
                                  invoice.status === 'PAID' ? 'default' : 
                                  invoice.status === 'PARTIAL' ? 'secondary' : 'outline'
                                }>
                                  {invoice.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground text-xs mb-1">Total Amount</div>
                                  <div className="font-semibold">₹{invoice.amount.toLocaleString('en-IN')}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs mb-1">Paid Amount</div>
                                  <div className="font-semibold text-emerald-600">₹{invoice.paidAmount.toLocaleString('en-IN')}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs mb-1">Balance</div>
                                  <div className={`font-semibold ${invoice.balanceAmount > 0 ? "text-destructive" : ""}`}>
                                    ₹{invoice.balanceAmount.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              {invoice.payments && invoice.payments.length > 0 && (
                                <div className="mt-4 pt-4 border-t bg-muted/10 -mx-4 px-4 pb-1">
                                  <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" /> Payment History
                                  </h4>
                                  <div className="space-y-2">
                                    {invoice.payments.map(payment => (
                                      <div key={payment.id} className="flex justify-between items-center text-sm py-1">
                                        <div className="text-muted-foreground">
                                          {format(new Date(payment.paidAt), "MMM d, yyyy")} • {payment.method}
                                        </div>
                                        <div className="font-medium text-emerald-600">
                                          + ₹{payment.amount.toLocaleString('en-IN')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

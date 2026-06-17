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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { CustomerStats, getCustomerDetails } from "@/services/customer.service";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-xl w-[90vw] flex flex-col p-0 border-l border-border/50">
        <SheetHeader className="p-6 pb-4 bg-muted/20 shrink-0">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-bold tracking-tight">{customer.name}</SheetTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
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
              Orders
            </Button>
          </div>
        </SheetHeader>

        <Separator />

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-2 shrink-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="financials">Bills</TabsTrigger>
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
                      <div className="flex flex-col gap-1 p-4 bg-muted/30 border border-border/50 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                          <Phone className="h-3 w-3 mr-1.5" /> Phone
                        </div>
                        <div className="font-medium">{details.phone}</div>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-muted/30 border border-border/50 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                          <MapPin className="h-3 w-3 mr-1.5" /> Address
                        </div>
                        <div className="font-medium line-clamp-2" title={details.address || undefined}>{details.address || "-"}</div>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-muted/30 border border-border/50 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                          <CalendarIcon className="h-3 w-3 mr-1.5" /> Member Since
                        </div>
                        <div className="font-medium">{format(new Date(details.createdAt), "MMM d, yyyy")}</div>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-muted/30 border border-border/50 rounded-lg">
                        <div className="flex items-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                          <IndianRupee className="h-3 w-3 mr-1.5" /> Outstanding
                        </div>
                        <div className={`font-bold ${customer.pendingAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>
                          ₹{customer.pendingAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {details.notes && (
                      <div className="p-4 border border-border/50 bg-card rounded-lg">
                        <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Customer Notes</h4>
                        <p className="text-sm">{details.notes}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-0">
                    {details.orders.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                        No orders found for this customer.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {details.orders.map((order) => (
                          <div key={order.id} className="p-4 border rounded-lg flex flex-col gap-3 bg-card hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="font-medium flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-primary/70" />
                                {order.orderNumber}
                              </div>
                              <Badge variant="outline" className="bg-background">{order.status}</Badge>
                            </div>
                            <div className="flex justify-between items-end text-sm text-muted-foreground">
                              <div>
                                {format(new Date(order.deliveryDate), "MMM d, yyyy")}
                              </div>
                              <div className="font-semibold text-foreground text-base">
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="text-xs bg-muted/50 p-2 rounded-md flex flex-wrap gap-2">
                              {order.items.map(item => (
                                <span key={item.id} className="bg-background px-2 py-1 rounded shadow-sm border border-border/50 font-medium">
                                  {item.product.name} × {item.quantity} {item.product.unit.toLowerCase()}
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
                         <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                           No bills generated for this customer.
                         </div>
                      ) : (
                        details.orders.filter(o => o.invoice).map((order) => {
                          const invoice = order.invoice!;
                          return (
                            <div key={invoice.id} className="p-5 border rounded-lg space-y-4 bg-card">
                              <div className="flex justify-between items-center pb-3 border-b">
                                <div className="flex items-center gap-2 font-semibold">
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

                              <div className="grid grid-cols-3 gap-4 text-sm bg-muted/20 p-3 rounded-md">
                                <div>
                                  <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Total</div>
                                  <div className="font-semibold text-base">₹{invoice.amount.toLocaleString('en-IN')}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Paid</div>
                                  <div className="font-semibold text-emerald-600 text-base">₹{invoice.paidAmount.toLocaleString('en-IN')}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Balance</div>
                                  <div className={`font-semibold text-base ${invoice.balanceAmount > 0 ? "text-destructive" : ""}`}>
                                    ₹{invoice.balanceAmount.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              {invoice.payments && invoice.payments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-dashed">
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="h-3 w-3" /> Payment History
                                  </h4>
                                  <div className="space-y-2">
                                    {invoice.payments.map(payment => (
                                      <div key={payment.id} className="flex justify-between items-center text-sm py-1.5 px-3 bg-muted/30 rounded-md">
                                        <div className="text-muted-foreground">
                                          {format(new Date(payment.paidAt), "MMM d, yyyy")} <span className="opacity-50 mx-1">•</span> {payment.method}
                                        </div>
                                        <div className="font-semibold text-emerald-600">
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
      </SheetContent>
    </Sheet>
  );
}

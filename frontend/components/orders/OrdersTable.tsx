"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Eye, Ban, FileText, MessageSquare, Check, Clock, Package, Truck, CheckCircle, ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderStatus, updateOrderStatus, cancelOrder, getDeliveryMessage, downloadWorkerSlip } from "@/services/order.service";
import { StatusBadge } from "./StatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { ViewOrderDialog } from "./ViewOrderDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";

export type SortColumn = "orderNumber" | "customerName" | "phoneNumber" | "deliveryDate" | "totalAmount" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status")
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: () => toast.error("Failed to cancel order")
  });

  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    statusMutation.mutate({ id, status });
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelMutation.mutate(id);
    }
  };

  const handleWhatsApp = async (id: string) => {
    try {
      const res = await getDeliveryMessage(id);
      window.open(res.whatsappUrl, "_blank");
      toast.success("Opened WhatsApp");
    } catch (error) {
      toast.error("Failed to generate WhatsApp message");
    }
  };

  const handleWorkerSlip = async (id: string, orderNumber: string) => {
    try {
      toast.info("Downloading worker slip...");
      await downloadWorkerSlip(id, orderNumber);
      toast.success("Worker slip downloaded successfully");
    } catch (error) {
      toast.error("Failed to download worker slip");
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Order];
      let bVal: any = b[sortColumn as keyof Order];

      if (sortColumn === "customerName") {
        aVal = a.customer?.name || "";
        bVal = b.customer?.name || "";
      } else if (sortColumn === "phoneNumber") {
        aVal = a.contactNumber || a.customer?.phone || "";
        bVal = b.contactNumber || b.customer?.phone || "";
      } else if (sortColumn === "deliveryDate" || sortColumn === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [orders, sortColumn, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ChevronsUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === "asc" ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
        <p className="text-muted-foreground max-w-md">There are no orders matching your current criteria. Create a new order to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("orderNumber")}>
                  <div className="flex items-center">Order # {renderSortIcon("orderNumber")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("customerName")}>
                  <div className="flex items-center">Customer {renderSortIcon("customerName")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("phoneNumber")}>
                  <div className="flex items-center">Phone {renderSortIcon("phoneNumber")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("deliveryDate")}>
                  <div className="flex items-center">Delivery Date {renderSortIcon("deliveryDate")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("totalAmount")}>
                  <div className="flex items-center">Amount {renderSortIcon("totalAmount")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">Status {renderSortIcon("status")}</div>
                </TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center">Created At {renderSortIcon("createdAt")}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const deliveryD = new Date(order.deliveryDate);
                const createdD = new Date(order.createdAt);
                
                return (
                  <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">{order.orderNumber}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{order.customer?.name || "Unknown"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{order.contactNumber || order.customer?.phone || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{deliveryD.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="text-xs text-muted-foreground">{deliveryD.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{(order.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{createdD.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="text-xs text-muted-foreground">{createdD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="outline" className="h-8 w-8 p-0 rounded-lg">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {(order.status === "DELIVERED" || order.status === "OUT_FOR_DELIVERY") && order.paymentStatus !== "PAID" && (
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setPaymentDialogOpen(true); }}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Record Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          
                          {order.status !== "CANCELLED" && (
                            <>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Update Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "PENDING")}>
                                    <Clock className="mr-2 h-4 w-4" /> Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "PREPARING")}>
                                    <Package className="mr-2 h-4 w-4" /> Preparing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "READY")}>
                                    <Check className="mr-2 h-4 w-4" /> Ready
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY")}>
                                    <Truck className="mr-2 h-4 w-4" /> Out for Delivery
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "DELIVERED")}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              
                              <DropdownMenuItem onClick={() => handleWorkerSlip(order.id, order.orderNumber)}>
                                <FileText className="mr-2 h-4 w-4" /> Print Worker Slip
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleWhatsApp(order.id)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Delivery
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleCancel(order.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" /> Cancel Order
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(startIndex + 1, sortedOrders.length)} to {Math.min(startIndex + itemsPerPage, sortedOrders.length)} of {sortedOrders.length} orders
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-8 text-center">{currentPage}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue placeholder="10 / page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ViewOrderDialog 
        order={selectedOrder} 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
      />

      <RecordPaymentDialog
        order={selectedOrder}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
      />
    </>
  );
}

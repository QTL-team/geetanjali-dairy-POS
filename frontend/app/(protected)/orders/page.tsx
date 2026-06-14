"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";

import { getOrders, OrderStatus } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateOrderSheet } from "@/components/orders/CreateOrderSheet";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrdersSummary } from "@/components/orders/OrdersSummary";
import { RotateCcw } from "lucide-react";

export default function OrdersPage() {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (order.orderNumber || "").toLowerCase().includes(searchLower) ||
        (order.customer?.name || "").toLowerCase().includes(searchLower) ||
        (order.contactNumber || order.customer?.phone || "").toLowerCase().includes(searchLower);

      // Status Filter
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

      // Date Filter
      const orderDate = new Date(order.deliveryDate).toISOString().split("T")[0];
      const matchesDate = !dateFilter || orderDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchQuery, statusFilter, dateFilter]);

  return (
    <div className="flex-1 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer orders and delivery workflow.
          </p>
        </div>
        <Button onClick={() => setCreateSheetOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      <OrdersSummary orders={orders} />

      <div className="flex flex-col md:flex-row gap-4 bg-card p-3 rounded-lg border items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Order #, Customer Name or Phone..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val) }}>
            <SelectTrigger className="bg-muted/50 border-transparent focus:border-primary">
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[200px] relative">
          <Input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-muted/50 border-transparent focus-visible:border-primary"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("ALL");
            setDateFilter("");
          }}
          className="w-full md:w-auto flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100">
          Failed to load orders. Please try again.
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}

      <CreateOrderSheet 
        open={createSheetOpen} 
        onOpenChange={setCreateSheetOpen} 
      />
    </div>
  );
}

import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { Order } from "@/services/order.service";

interface OrdersSummaryProps {
  orders: Order[];
}

export function OrdersSummary({ orders }: OrdersSummaryProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;
  const outForDelivery = orders.filter((o) => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

  return (
    <div className="hidden md:grid grid-cols-5 gap-4 bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex items-center gap-4 p-2 border-r last:border-r-0">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
          <p className="text-xs text-green-600 font-medium">↑ Active workflow</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-2 border-r last:border-r-0">
        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{pendingOrders}</p>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-2 border-r last:border-r-0">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Truck className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Out for Delivery</p>
          <p className="text-2xl font-bold">{outForDelivery}</p>
          <p className="text-xs text-muted-foreground">On the way</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-2 border-r last:border-r-0">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold">{delivered}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-2">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold">{cancelled}</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </div>
    </div>
  );
}

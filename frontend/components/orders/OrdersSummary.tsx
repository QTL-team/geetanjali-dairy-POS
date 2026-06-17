import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { Order } from "@/services/order.service";
import { StatCard } from "@/components/shared/stat-card";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Orders"
        value={totalOrders}
        icon={Package}
        trend="up"
        trendValue="Active workflow"
      />
      <StatCard
        title="Pending"
        value={pendingOrders}
        icon={Clock}
        trend={pendingOrders > 0 ? "down" : "neutral"}
        trendValue={pendingOrders > 0 ? "Needs attention" : ""}
      />
      <StatCard
        title="Out for Delivery"
        value={outForDelivery}
        icon={Truck}
        trend="neutral"
        trendValue="On the way"
      />
      <StatCard
        title="Delivered"
        value={delivered}
        icon={CheckCircle}
        trend="neutral"
        trendValue="Completed"
      />
      <StatCard
        title="Cancelled"
        value={cancelled}
        icon={XCircle}
        trend="neutral"
        trendValue="This month"
      />
    </div>
  );
}

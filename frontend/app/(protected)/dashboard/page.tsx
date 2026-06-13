"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  IndianRupee, 
  CreditCard, 
  Clock, 
  FileText,
  AlertTriangle
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/services/dashboard.service";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your dairy business performance." 
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
        <EmptyState 
          title="Unable to connect to server" 
          description="The dashboard couldn't retrieve the latest statistics. Check your connection or contact support."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your dairy business performance." 
      />
      
      {/* Top Section - 8 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={Users}
        />
        <StatCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
        />
        <StatCard
          title="Delivered Orders"
          value={data.deliveredOrders}
          icon={Truck}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${data.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${data.todayRevenue.toLocaleString()}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Pending Payments"
          value={data.pendingPayments}
          icon={CreditCard}
          trend={data.pendingPayments > 0 ? "down" : "neutral"}
          trendValue={data.pendingPayments > 0 ? "Requires attention" : ""}
        />
        <StatCard
          title="Tomorrow Deliveries"
          value={data.tomorrowDeliveries}
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products that need to be produced or restocked.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <EmptyState 
                title="All Good!" 
                description="No products are currently low in stock."
                icon={<Package className="h-10 w-10 text-muted-foreground" />}
              />
            ) : (
              <div className="space-y-4">
                {data.lowStockProducts.map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{product.name || `Product #${product.id}`}</p>
                      <p className="text-sm text-muted-foreground">Current Stock: {product.stock || 0}</p>
                    </div>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
                      Low Stock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Summary */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
            <CardDescription>Items requiring your immediate attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Tomorrow's Deliveries</p>
                  <p className="text-sm text-muted-foreground">Orders scheduled for delivery</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{data.tomorrowDeliveries}</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Pending Orders</p>
                  <p className="text-sm text-muted-foreground">Orders awaiting processing</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{data.pendingOrders}</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Pending Invoices</p>
                  <p className="text-sm text-muted-foreground">Invoices awaiting payment</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{data.pendingInvoices}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

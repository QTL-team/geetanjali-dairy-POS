import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Package, IndianRupee, RefreshCcw } from "lucide-react";
import api from "@/lib/api/axios";

interface ReturnsTabProps {
  startDate: string;
  endDate: string;
}

const getReturnMetrics = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/reports/returns?${params.toString()}`);
  return response.data;
};

export function ReturnsTab({ startDate, endDate }: ReturnsTabProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["return-metrics", startDate, endDate],
    queryFn: () => getReturnMetrics(startDate, endDate),
  });

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>;
  }

  if (error || !data) {
    return <Alert variant="destructive"><AlertDescription>Failed to load return metrics.</AlertDescription></Alert>;
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "totalReturned",
      header: "Quantity Returned",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Returned Items"
          value={data.totalReturnedQty}
          icon={Package}
        />
        <StatCard
          title="Value of Returned Goods"
          value={`₹${data.totalReturnValue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={data.totalReturnValue > 0 ? "down" : "neutral"}
          trendValue="Impacts revenue"
        />
        <StatCard
          title="Returned Stock Value"
          value={`₹${data.totalReturnedStockValue.toLocaleString('en-IN')}`}
          icon={RefreshCcw}
          trend="neutral"
          trendValue="Recouped inventory value"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Returned Products</CardTitle>
          <CardDescription>Most frequently returned items in this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={data.topReturnedProducts} 
            emptyTitle="No returns"
            emptyDescription="No products were returned in the selected date range."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer-wise Returns</CardTitle>
          <CardDescription>Customers with the highest return volumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { accessorKey: "name", header: "Customer Name" },
              { accessorKey: "totalReturned", header: "Quantity Returned" }
            ]} 
            data={data.customerWiseReturns || []} 
            emptyTitle="No returns"
            emptyDescription="No products were returned in the selected date range."
          />
        </CardContent>
      </Card>
    </div>
  );
}

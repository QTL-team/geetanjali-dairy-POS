import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/shared/data-table";
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Returned Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReturnedQty}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Value of Returned Goods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{data.totalReturnValue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returned Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{data.totalReturnedStockValue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
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
    </div>
  );
}

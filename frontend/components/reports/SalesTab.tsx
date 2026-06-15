import { useQuery } from "@tanstack/react-query";
import { getSalesReport } from "@/services/report.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { DataTable } from "@/components/shared/data-table";

interface SalesTabProps {
  startDate: string;
  endDate: string;
}

export function SalesTab({ startDate, endDate }: SalesTabProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sales-report", startDate, endDate],
    queryFn: () => getSalesReport(startDate, endDate),
  });

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>;
  }

  if (error || !data) {
    return <Alert variant="destructive"><AlertDescription>Failed to load sales report.</AlertDescription></Alert>;
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "totalSold",
      header: "Quantity Sold",
    }
  ];

  const totalRevenue = data.dailyRevenue.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Total revenue in selected period: <span className="font-bold text-emerald-600">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {data.dailyRevenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No revenue data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={12} 
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getDate()}/${d.getMonth()+1}`;
                    }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={12} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Highest moving items by quantity in this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={data.topProducts} 
            emptyTitle="No products sold"
            emptyDescription="No sales recorded in the selected date range."
          />
        </CardContent>
      </Card>
    </div>
  );
}

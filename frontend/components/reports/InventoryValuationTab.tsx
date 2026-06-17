import { useQuery } from "@tanstack/react-query";
import { getInventorySummary } from "@/services/inventory.service";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IndianRupee, Package } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

export function InventoryValuationTab() {
  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: getInventorySummary,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>Failed to load inventory valuation.</AlertDescription></Alert>;
  }

  const valuationData = inventory.map(item => ({
    ...item,
    totalValue: item.availableStock * item.sellingPrice
  }));

  const totalStockValue = valuationData.reduce((sum, item) => sum + item.totalValue, 0);

  const columns = [
    {
      accessorKey: "name",
      header: "Product",
    },
    {
      accessorKey: "availableStock",
      header: "Stock Quantity",
      cell: ({ row }: any) => {
        return <span>{row.original.availableStock} {row.original.unit}</span>;
      }
    },
    {
      accessorKey: "sellingPrice",
      header: "Unit Price",
      cell: ({ row }: any) => `₹${row.original.sellingPrice}`
    },
    {
      accessorKey: "totalValue",
      header: "Total Value",
      cell: ({ row }: any) => <span className="font-bold">₹{row.original.totalValue.toLocaleString('en-IN')}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Products in Stock"
          value={valuationData.filter(d => d.availableStock > 0).length}
          icon={Package}
        />
        <StatCard
          title="Total Inventory Value"
          value={`₹${totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          icon={IndianRupee}
          trend="neutral"
          trendValue="Based on current selling prices"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Valuation Table</CardTitle>
          <CardDescription>Breakdown of current stock worth by product.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={valuationData} 
            emptyTitle="No inventory found"
            emptyDescription="Add stock to see inventory valuation."
          />
        </CardContent>
      </Card>
    </div>
  );
}

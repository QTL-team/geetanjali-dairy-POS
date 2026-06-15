import { useQuery } from "@tanstack/react-query";
import { getInventorySummary } from "@/services/inventory.service";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IndianRupee, Package } from "lucide-react";

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valuationData.filter(d => d.availableStock > 0).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on current selling prices</p>
          </CardContent>
        </Card>
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

import { useQuery } from "@tanstack/react-query";
import { getOutstandingBalancesReport } from "@/services/report.service";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function OutstandingBalancesTab() {
  const { data: balances = [], isLoading, error } = useQuery({
    queryKey: ["outstanding-report"],
    queryFn: getOutstandingBalancesReport,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>Failed to load outstanding balances.</AlertDescription></Alert>;
  }

  const columns = [
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }: any) => <span className="font-semibold">{row.original.customerName}</span>
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      cell: ({ row }: any) => row.original.phone || "N/A"
    },
    {
      accessorKey: "pendingAmount",
      header: "Pending Balance",
      cell: ({ row }: any) => <span className="font-bold text-destructive">₹{row.original.pendingAmount.toLocaleString('en-IN')}</span>
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.success(`Reminder scheduled for ${row.original.customerName}`)}
          >
            <Bell className="w-4 h-4 mr-2" />
            Remind
          </Button>
        );
      }
    }
  ];

  const handleBulkRemind = () => {
    toast.success(`Bulk reminder scheduled for ${balances.length} customers.`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Outstanding Balances</CardTitle>
            <CardDescription>Customers with pending payments for delivered orders or invoices.</CardDescription>
          </div>
          <Button onClick={handleBulkRemind} disabled={balances.length === 0}>
            <Bell className="w-4 h-4 mr-2" />
            Send Bulk Reminder
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={balances} 
            emptyTitle="No outstanding balances"
            emptyDescription="All customers are fully paid up!"
          />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { SalesTab } from "@/components/reports/SalesTab";
import { InventoryValuationTab } from "@/components/reports/InventoryValuationTab";
import { OutstandingBalancesTab } from "@/components/reports/OutstandingBalancesTab";
import { ReturnsTab } from "@/components/reports/ReturnsTab";
import { subDays, format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getSalesReport, getOutstandingBalancesReport } from "@/services/report.service";
import { getInventorySummary } from "@/services/inventory.service";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("sales");
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const exportCSV = async () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      let dataToExport: any[] = [];
      let headers: string[] = [];

      if (activeTab === "sales") {
        // Fetch or get from cache
        const data: any = await queryClient.fetchQuery({
          queryKey: ["sales-report", startDate, endDate],
          queryFn: () => getSalesReport(startDate, endDate)
        });
        // We export Top Products for Sales CSV
        headers = ["Product Name", "Quantity Sold"];
        dataToExport = data.topProducts.map((p: any) => [p.name, p.totalSold]);
      } else if (activeTab === "inventory") {
        const data: any = await queryClient.fetchQuery({
          queryKey: ["inventory-summary"],
          queryFn: getInventorySummary
        });
        headers = ["Product Name", "Available Stock", "Selling Price", "Total Value"];
        dataToExport = data.map((p: any) => [
          p.name, 
          p.availableStock, 
          p.sellingPrice, 
          p.availableStock * p.sellingPrice
        ]);
      } else if (activeTab === "outstanding") {
        const data: any = await queryClient.fetchQuery({
          queryKey: ["outstanding-report"],
          queryFn: getOutstandingBalancesReport
        });
        headers = ["Customer Name", "Phone", "Pending Balance"];
        dataToExport = data.map((c: any) => [c.customerName, c.phone || "", c.pendingAmount]);
      }

      // Build CSV
      csvContent += headers.join(",") + "\n";
      dataToExport.forEach((row) => {
        csvContent += row.join(",") + "\n";
      });

      // Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${activeTab}_report_${format(new Date(), "yyyyMMdd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful!");
    } catch (e) {
      toast.error("Failed to export data.");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Reports & Analytics" 
          description="View sales trends, inventory valuation, and outstanding debt."
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {(activeTab === "sales" || activeTab === "returns") && (
            <div className="flex items-center gap-2 bg-background border rounded-md p-1 shadow-sm">
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto border-none h-8 text-sm focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto border-none h-8 text-sm focus-visible:ring-0"
              />
            </div>
          )}
          
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[800px] mb-6">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Valuation</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Balances</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-0">
          <SalesTab startDate={startDate} endDate={endDate} />
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-0">
          <InventoryValuationTab />
        </TabsContent>
        
        <TabsContent value="outstanding" className="mt-0">
          <OutstandingBalancesTab />
        </TabsContent>

        <TabsContent value="returns" className="mt-0">
          <ReturnsTab startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

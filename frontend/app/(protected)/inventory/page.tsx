"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertTriangle, IndianRupee, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

import { getInventorySummary, InventorySummary } from "@/services/inventory.service";
import { getColumns } from "./columns";
import { AdjustStockDialog } from "@/components/inventory/AdjustStockDialog";
import { InventoryHistoryDrawer } from "@/components/inventory/InventoryHistoryDrawer";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<InventorySummary | null>(null);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<InventorySummary | null>(null);

  const { 
    data: inventory = [], 
    isLoading, 
    error
  } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: getInventorySummary,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Inventory Management" 
          description="Manage stock levels, reservations, and view movement history."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[120px] bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Inventory Management" 
          description="Manage stock levels, reservations, and view movement history."
        />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load inventory data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Derived metrics
  const totalSKUs = inventory.length;
  const lowStockCount = inventory.filter(p => p.isLowStock || p.availableStock <= 0).length;
  const totalStockValue = inventory.reduce((sum, p) => sum + (p.availableStock * p.sellingPrice), 0);

  // Search filtering
  const filteredInventory = inventory.filter((product) => {
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const columns = getColumns({
    onAdjustStock: (product) => setSelectedProductForAdjust(product),
    onViewHistory: (product) => setSelectedProductForHistory(product),
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader 
        title="Inventory Management" 
        description="Manage stock levels, reservations, and view movement history."
      />
      
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSKUs}</div>
          </CardContent>
        </Card>
        
        <Card className={lowStockCount > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-amber-500" : ""}`}>
              {lowStockCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on selling price</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {inventory.length === 0 ? (
          <EmptyState 
            title="No Products Found" 
            description="Add products to your catalog to start managing inventory."
            icon={<Package className="h-10 w-10 text-muted-foreground" />}
          />
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <DataTable 
              columns={columns} 
              data={filteredInventory} 
              emptyTitle="No matching products"
              emptyDescription="Try adjusting your search query."
            />
          </div>
        )}
      </div>

      <AdjustStockDialog 
        product={selectedProductForAdjust}
        open={!!selectedProductForAdjust}
        onOpenChange={(open) => !open && setSelectedProductForAdjust(null)}
      />

      <InventoryHistoryDrawer
        product={selectedProductForHistory}
        open={!!selectedProductForHistory}
        onOpenChange={(open) => !open && setSelectedProductForHistory(null)}
      />
    </div>
  );
}

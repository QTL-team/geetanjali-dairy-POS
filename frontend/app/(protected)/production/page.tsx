"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  AlertTriangle, 
  Factory, 
  ShoppingCart, 
  Package, 
  IndianRupee, 
  RefreshCw,
  Printer
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getProductionPlan, ProductionProduct } from "@/services/production.service";
import { columns } from "./columns";
import { ProductionSkeleton } from "./production-skeleton";

export default function ProductionPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { 
    data: plan, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["production", "tomorrow"],
    queryFn: getProductionPlan,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Production Planning" 
          description="Products required for upcoming deliveries."
          action={
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button disabled>
                <Printer className="mr-2 h-4 w-4" />
                Print Production Sheet
              </Button>
            </div>
          }
        />
        <ProductionSkeleton />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Production Planning" 
          description="Products required for upcoming deliveries."
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load production plan. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="w-fit">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Client-side search filtering
  const filteredProducts = plan.products.filter((product) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(query);
    const gujaratiMatch = product.gujaratiName 
      ? product.gujaratiName.toLowerCase().includes(query)
      : false;
      
    return nameMatch || gujaratiMatch;
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader 
        title="Production Planning" 
        description={`Products required for upcoming deliveries (${plan.date}).`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Production Sheet
            </Button>
          </div>
        }
      />
      
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Tomorrow Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders to fulfill</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Products To Produce</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique products needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{plan.estimatedRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">From tomorrow's deliveries</p>
          </CardContent>
        </Card>
        
        <Card className={plan.lowStockWarnings.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${plan.lowStockWarnings.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${plan.lowStockWarnings.length > 0 ? "text-destructive" : ""}`}>
              {plan.lowStockWarnings.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Products needing production</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning Section */}
      {plan.lowStockWarnings.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Production Required
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plan.lowStockWarnings.map((warning) => (
              <Alert key={warning.productId} className="border-destructive/50 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive font-semibold flex items-center gap-2">
                  {warning.name}
                  {warning.gujaratiName && <span className="font-gujarati text-sm font-normal text-destructive/80">({warning.gujaratiName})</span>}
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-foreground grid grid-cols-2 gap-y-1">
                  <span className="text-muted-foreground">Need:</span>
                  <span className="font-medium text-right">{warning.required} {warning.unit}</span>
                  
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium text-right">{warning.available} {warning.unit}</span>
                  
                  <span className="text-destructive font-semibold">Shortage:</span>
                  <span className="text-destructive font-semibold text-right">{warning.shortage} {warning.unit}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}
      
      {plan.products.length === 0 ? (
        <EmptyState 
          title="No Production Required" 
          description="There are no products needed for tomorrow's deliveries."
          icon={<Factory className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name or Gujarati..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable 
              columns={columns} 
              data={filteredProducts} 
              emptyTitle="No matching products"
              emptyDescription="Try adjusting your search query."
            />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No matching products
              </div>
            ) : (
              filteredProducts.map((product: ProductionProduct) => (
                <Card key={product.productId} className="overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-base">{product.name}</h4>
                        {product.gujaratiName && (
                          <p className="text-sm font-gujarati text-muted-foreground">
                            {product.gujaratiName}
                          </p>
                        )}
                      </div>
                      {product.status === "READY" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">Ready</Badge>
                      ) : (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Required</span>
                        <span className="font-semibold">{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Available</span>
                        <span>{product.currentStock} {product.unit}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

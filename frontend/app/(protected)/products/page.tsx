"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, AlertTriangle, PackageOpen, Package, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { getProducts } from "@/services/product.service";
import { columns } from "@/components/products/columns";
import { ProductsSkeleton } from "@/components/products/products-skeleton";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { StatCard } from "@/components/shared/stat-card";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Products" 
          description="Manage dairy products and inventory information."
          action={<AddProductDialog />}
        />
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              disabled
            />
          </div>
        </div>
        <ProductsSkeleton />
      </div>
    );
  }

  if (error || !products) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Products" 
          description="Manage dairy products and inventory information." 
          action={<AddProductDialog />}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load products. Please try again later.
          </AlertDescription>
        </Alert>
        <EmptyState 
          title="Unable to connect to server" 
          description="Could not retrieve the product list."
        />
      </div>
    );
  }

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.availableStock <= p.lowStockThreshold).length;
  const totalReserved = products.reduce((acc, p) => acc + p.reservedStock, 0);

  // Client-side search filtering
  const filteredProducts = products.filter((product) => {
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
        title="Products" 
        description="Manage dairy products and inventory information."
        action={<AddProductDialog />}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={CheckCircle}
          trend="neutral"
          trendValue="Currently available"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockProducts}
          icon={AlertCircle}
          trend={lowStockProducts > 0 ? "down" : "neutral"}
          trendValue={lowStockProducts > 0 ? "Requires restock" : "Stock healthy"}
        />
        <StatCard
          title="Reserved Items"
          value={totalReserved}
          icon={Clock}
          trend="neutral"
          trendValue="For pending orders"
        />
      </div>
      
      {products.length === 0 ? (
        <EmptyState 
          title="No products found" 
          description="You haven't added any products yet."
          icon={<PackageOpen className="h-10 w-10 text-muted-foreground" />}
          actionLabel="Add Product"
          // We can't directly trigger Dialog from here cleanly without refactoring, 
          // so the user will use the top-right button which is standard.
        />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <DataTable 
            columns={columns} 
            data={filteredProducts} 
            emptyTitle="No matching products"
            emptyDescription="Try adjusting your search query."
          />
        </>
      )}
    </div>
  );
}

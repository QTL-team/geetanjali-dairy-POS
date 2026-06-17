"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, IndianRupee, Search, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

import { getCustomers, CustomerStats } from "@/services/customer.service";
import { getColumns } from "./columns";
import { CustomerDialog } from "./components/customer-dialog";
import { StatCard } from "@/components/shared/stat-card";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<CustomerStats | null>(null);

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Customer Directory" 
          description="Manage your customers, view their order history, and track outstanding balances."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !customers) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Customer Directory" 
          description="Manage your customers, view their order history, and track outstanding balances."
        />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load customers. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Derived metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length;
  const outstandingCustomers = customers.filter(c => c.pendingAmount > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);

  // Search filtering
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    );
  });

  const columns = getColumns({
    onView: (customer) => setSelectedCustomerForView(customer),
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader 
        title="Customer Directory" 
        description="Manage your customers, view their order history, and track outstanding balances."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers}
          icon={UserCheck}
          trend="neutral"
          trendValue="Have placed orders"
        />
        <StatCard
          title="Outstanding Balances"
          value={outstandingCustomers}
          icon={ShieldAlert}
          trend={outstandingCustomers > 0 ? "down" : "neutral"}
          trendValue={outstandingCustomers > 0 ? "Customers with pending amount" : "All cleared"}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
        />
      </div>

      {customers.length === 0 ? (
        <EmptyState 
          title="No Customers Found" 
          description="Customers will appear here once they are created."
          icon={<Users className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or phone..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable 
              columns={columns} 
              data={filteredCustomers} 
              emptyTitle="No matching customers"
              emptyDescription="Try adjusting your search query."
            />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No matching customers
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-base">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      <div className={`font-bold text-lg ${customer.pendingAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>
                        ₹{customer.pendingAmount > 0 ? customer.pendingAmount.toLocaleString('en-IN') : '0'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Total Orders</span>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Total Revenue</span>
                        <span className="font-medium text-emerald-600">₹{customer.totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => setSelectedCustomerForView(customer)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dialog */}
      <CustomerDialog 
        customer={selectedCustomerForView} 
        open={!!selectedCustomerForView} 
        onOpenChange={(open) => !open && setSelectedCustomerForView(null)} 
      />
    </div>
  );
}

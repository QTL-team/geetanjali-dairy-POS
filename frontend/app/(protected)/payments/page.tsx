"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  CreditCard,
  IndianRupee,
  Calendar,
  Wallet
} from "lucide-react";
import { isToday, isThisMonth } from "date-fns";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getPayments } from "@/services/payment.service";
import { getInvoices } from "@/services/invoice.service";
import { getDashboardData } from "@/services/dashboard.service";
import { getColumns } from "./columns";
import { PaymentDialog } from "./components/payment-dialog";

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [selectedPaymentForView, setSelectedPaymentForView] = useState<string | null>(null);

  const { 
    data: payments, 
    isLoading: isLoadingPayments, 
    error: paymentsError
  } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  if (isLoadingPayments) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Payments" 
          description="View and track all payment collections."
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

  if (paymentsError || !payments) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Payments" 
          description="View and track all payment collections."
        />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load payments. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Derived metrics
  const totalPayments = payments.length;
  const todayCollection = payments
    .filter(p => isToday(new Date(p.paidAt)))
    .reduce((sum, p) => sum + p.amount, 0);
  const monthCollection = payments
    .filter(p => isThisMonth(new Date(p.paidAt)))
    .reduce((sum, p) => sum + p.amount, 0);
    
  // Use pendingPayments from dashboard which correctly tracks uninvoiced orders + invoices
  const outstandingAmount = dashboard?.pendingPayments || 0;

  // Search filtering
  const filteredPayments = payments.filter((payment) => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const invMatch = payment.invoiceNumber.toLowerCase().includes(query);
      const custMatch = payment.customerName.toLowerCase().includes(query);
      if (!invMatch && !custMatch) return false;
    }
    
    // Method/Type filter
    if (methodFilter !== "ALL") {
      const matchType = payment.paymentType === methodFilter;
      const matchMethod = payment.method.toUpperCase().includes(methodFilter.toUpperCase());
      if (!matchType && !matchMethod) return false;
    }
    
    // Date filter
    if (dateFilter !== "ALL") {
      const paymentDate = new Date(payment.paidAt);
      if (dateFilter === "TODAY" && !isToday(paymentDate)) return false;
      if (dateFilter === "THIS_MONTH" && !isThisMonth(paymentDate)) return false;
    }
      
    return true;
  });

  const columns = getColumns({
    onView: (payment) => setSelectedPaymentForView(payment.id),
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader 
        title="Payments" 
        description="View and track all payment collections."
      />
      
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Today&apos;s Collection</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{todayCollection.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{monthCollection.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card className={outstandingAmount > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <IndianRupee className={`h-4 w-4 ${outstandingAmount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${outstandingAmount > 0 ? "text-destructive" : ""}`}>
              ₹{outstandingAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across invoices & orders</p>
          </CardContent>
        </Card>
      </div>

      {payments.length === 0 ? (
        <EmptyState 
          title="No Payments Found" 
          description="Payments recorded from the invoices section will appear here."
          icon={<CreditCard className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by customer name or invoice #..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={methodFilter} onValueChange={(val) => setMethodFilter(val || "ALL")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "ALL")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="TODAY">Today</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable 
              columns={columns} 
              data={filteredPayments} 
              emptyTitle="No matching payments"
              emptyDescription="Try adjusting your search query."
            />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No matching payments
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <Card key={payment.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-base">{payment.customerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {payment.invoiceNumber}
                        </p>
                      </div>
                      <div className="font-bold text-lg text-emerald-600">
                        ₹{payment.amount}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Date</span>
                        <span className="font-medium">
                          {isToday(new Date(payment.paidAt)) 
                            ? "Today" 
                            : new Date(payment.paidAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Method</span>
                        <span className="font-medium">{payment.method}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => setSelectedPaymentForView(payment.id)}
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
      <PaymentDialog 
        paymentId={selectedPaymentForView} 
        open={!!selectedPaymentForView} 
        onOpenChange={(open) => !open && setSelectedPaymentForView(null)} 
      />
    </div>
  );
}

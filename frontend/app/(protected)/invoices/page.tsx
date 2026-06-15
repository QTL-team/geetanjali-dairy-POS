"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  IndianRupee 
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getInvoices, InvoiceSummary } from "@/services/invoice.service";
import { getColumns } from "./columns";
import { InvoiceDialog } from "./components/invoice-dialog";
import { RecordPaymentDialog } from "./components/record-payment-dialog";
import api from "@/lib/api/axios";

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceSummary | null>(null);

  const { 
    data: invoices, 
    isLoading, 
    error
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Invoices" 
          description="Manage billing, track payments, and send reminders."
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

  if (error || !invoices) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Invoices" 
          description="Manage billing, track payments, and send reminders."
        />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load invoices. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Client-side search filtering
  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const invMatch = invoice.invoiceNumber.toLowerCase().includes(query);
    const ordMatch = invoice.order.orderNumber.toLowerCase().includes(query);
    const custMatch = invoice.customer.name.toLowerCase().includes(query);
      
    return invMatch || ordMatch || custMatch;
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
  const pendingInvoices = invoices.filter(i => i.status !== 'PAID').length;
  const outstandingAmount = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  const columns = getColumns({
    onView: (inv) => setSelectedInvoiceForView(inv.id),
    onRecordPayment: (inv) => setSelectedInvoiceForPayment(inv),
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader 
        title="Invoices" 
        description="Manage billing, track payments, and send reminders."
      />
      
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
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
          </CardContent>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <EmptyState 
          title="No Invoices Found" 
          description="Invoices are generated automatically from completed orders."
          icon={<FileText className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice #, order # or customer..."
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
              data={filteredInvoices} 
              emptyTitle="No matching invoices"
              emptyDescription="Try adjusting your search query."
            />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No matching invoices
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-base">{invoice.invoiceNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer.name}
                        </p>
                      </div>
                      {invoice.status === "PAID" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500">Paid</Badge>
                      ) : invoice.status === "PARTIAL" ? (
                        <Badge variant="secondary">Partial</Badge>
                      ) : invoice.status === "SENT" ? (
                        <Badge variant="outline" className="border-blue-500 text-blue-500">Sent</Badge>
                      ) : (
                        <Badge variant="destructive">Draft</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Amount</span>
                        <span className="font-semibold">₹{invoice.amount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Balance</span>
                        <span className={invoice.balanceAmount > 0 ? "text-destructive font-medium" : ""}>
                          ₹{invoice.balanceAmount}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedInvoiceForView(invoice.id)}>
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={invoice.balanceAmount <= 0}
                        onClick={() => setSelectedInvoiceForPayment(invoice)}
                      >
                        Pay
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const { data } = await api.get(`/invoices/${invoice.id}/share`);
                          window.open(data.whatsappUrl, '_blank');
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <InvoiceDialog 
        invoiceId={selectedInvoiceForView} 
        open={!!selectedInvoiceForView} 
        onOpenChange={(open) => !open && setSelectedInvoiceForView(null)} 
      />
      
      <RecordPaymentDialog 
        invoice={selectedInvoiceForPayment} 
        open={!!selectedInvoiceForPayment} 
        onOpenChange={(open) => !open && setSelectedInvoiceForPayment(null)} 
      />
    </div>
  );
}

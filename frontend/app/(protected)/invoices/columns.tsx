"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { InvoiceSummary } from "@/services/invoice.service";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Download, Send, Bell, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api/axios";

interface ColumnActions {
  onView: (invoice: InvoiceSummary) => void;
  onRecordPayment: (invoice: InvoiceSummary) => void;
}

export const getColumns = (actions: ColumnActions): ColumnDef<InvoiceSummary>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => <div className="font-medium">{row.getValue("invoiceNumber")}</div>,
  },
  {
    accessorKey: "order.orderNumber",
    header: "Order #",
    cell: ({ row }) => <div>{row.original.order.orderNumber}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.customer.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.customer.phone}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <div className="font-medium">₹{row.getValue("amount")}</div>,
  },
  {
    accessorKey: "paidAmount",
    header: "Paid",
    cell: ({ row }) => <div className="text-emerald-600">₹{row.getValue("paidAmount")}</div>,
  },
  {
    accessorKey: "balanceAmount",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("balanceAmount") as number;
      return <div className={balance > 0 ? "text-destructive font-medium" : ""}>₹{balance}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "PAID") return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Paid</Badge>;
      if (status === "PARTIAL") return <Badge variant="secondary">Partial</Badge>;
      if (status === "SENT") return <Badge variant="outline" className="border-blue-500 text-blue-500">Sent</Badge>;
      return <Badge variant="destructive">Draft</Badge>;
    },
  },
  {
    accessorKey: "generatedAt",
    header: "Date",
    cell: ({ row }) => <div>{format(new Date(row.getValue("generatedAt")), "MMM d, yyyy")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      const handleDownloadPdf = () => {
        window.open(`http://localhost:3000/api/invoices/${invoice.id}/pdf`, '_blank'); // Assuming API is at /api or we just open the backend URL directly.
        // Wait, the backend URL is usually different. Let's use the API base url.
        window.open(`${api.defaults.baseURL}/invoices/${invoice.id}/pdf`, '_blank');
      };

      const handleSendInvoice = async () => {
        const { data } = await api.get(`/invoices/${invoice.id}/share`);
        window.open(data.whatsappUrl, '_blank');
      };

      const handlePaymentReminder = async () => {
        const { data } = await api.get(`/invoices/${invoice.id}/payment-reminder`);
        window.open(data.whatsappUrl, '_blank');
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onView(invoice)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice (WhatsApp)
            </DropdownMenuItem>
            {invoice.balanceAmount > 0 && (
              <DropdownMenuItem onClick={handlePaymentReminder}>
                <Bell className="mr-2 h-4 w-4" />
                Send Reminder
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => actions.onRecordPayment(invoice)}
              disabled={invoice.balanceAmount <= 0}
            >
              <IndianRupee className="mr-2 h-4 w-4" />
              Record Payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

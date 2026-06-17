"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentSummary } from "@/services/payment.service";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnActions {
  onView: (payment: PaymentSummary) => void;
}

export const getColumns = (actions: ColumnActions): ColumnDef<PaymentSummary>[] => [
  {
    accessorKey: "paidAt",
    header: "Date",
    cell: ({ row }) => <div>{format(new Date(row.getValue("paidAt")), "MMM d, yyyy h:mm a")}</div>,
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => <div className="text-base font-medium text-muted-foreground">{row.original.invoiceNumber}</div>,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => <div className="text-base md:text-lg font-semibold text-foreground">{row.original.customerName}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <div className="text-lg font-bold tabular-nums text-foreground">₹{row.getValue("amount")}</div>,
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => <div>{row.getValue("method")}</div>,
  },
  {
    accessorKey: "paymentType",
    header: "Type",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("paymentType")}</div>,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null;
      return <div className="text-muted-foreground truncate max-w-[150px]">{notes || "-"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => actions.onView(payment)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      );
    },
  },
];

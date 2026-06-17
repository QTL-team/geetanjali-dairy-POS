"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Phone, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerStats } from "@/services/customer.service";

interface ColumnsProps {
  onView: (customer: CustomerStats) => void;
}

export const getColumns = ({ onView }: ColumnsProps): import("@tanstack/react-table").ColumnDef<CustomerStats>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="text-base md:text-lg font-semibold text-foreground">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <a href={`tel:${phone}`} className="text-base text-blue-600 hover:underline">
          {phone}
        </a>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return <div className="max-w-[200px] text-base truncate">{address || "-"}</div>;
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
    cell: ({ row }) => (
      <div className="text-center text-base">{row.getValue("totalOrders")}</div>
    ),
  },
  {
    accessorKey: "totalRevenue",
    header: "Total Revenue",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalRevenue"));
      return <div className="text-lg font-bold tabular-nums text-foreground">₹{amount.toLocaleString("en-IN")}</div>;
    },
  },
  {
    accessorKey: "pendingAmount",
    header: "Pending Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("pendingAmount"));
      return (
        <div className={`text-lg font-bold tabular-nums ${amount > 0 ? "text-destructive" : "text-foreground"}`}>
          ₹{amount.toLocaleString("en-IN")}
        </div>
      );
    },
  },
  {
    accessorKey: "lastOrderDate",
    header: "Last Order",
    cell: ({ row }) => {
      const date = row.getValue("lastOrderDate") as string;
      if (!date) return <div>-</div>;
      return <div>{format(new Date(date), "MMM d, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      const handleWhatsApp = () => {
        const url = `https://wa.me/91${customer.phone}`;
        window.open(url, '_blank');
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(customer)}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={`/orders?customerId=${customer.id}`} className="flex items-center w-full" />}>
              <FileText className="mr-2 h-4 w-4" />
              View Orders
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href={`tel:${customer.phone}`} className="flex items-center w-full" />}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/services/product.service";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <div className="text-base md:text-lg font-semibold text-foreground">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "gujaratiName",
    header: "Gujarati Name",
    cell: ({ row }) => {
      const name = row.getValue("gujaratiName") as string;
      return <div className="text-muted-foreground">{name || "-"}</div>;
    },
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-normal text-xs">
          {row.getValue("unit")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("sellingPrice"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(price);
      return <div className="text-lg font-bold tabular-nums text-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "availableStock",
    header: "Available",
    cell: ({ row }) => {
      const stock = parseFloat(row.getValue("availableStock"));
      const threshold = row.original.lowStockThreshold;
      
      const isLowStock = stock <= threshold;
      
      return (
        <div className="flex items-center gap-2">
          <span>{stock}</span>
          {isLowStock && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              Low Stock
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "reservedStock",
    header: "Reserved",
    cell: ({ row }) => {
      const reserved = parseFloat(row.getValue("reservedStock"));
      return <div className="text-muted-foreground">{reserved}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <StatusBadge status={isActive ? "DELIVERED" : "CANCELLED"}>
          {isActive ? "Active" : "Inactive"}
        </StatusBadge>
      );
    },
  },
];

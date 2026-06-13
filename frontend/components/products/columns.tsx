"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/services/product.service";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
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
      return <div>{formatted}</div>;
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
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
              Low Stock
            </Badge>
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
        <Badge 
          variant="outline" 
          className={isActive 
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium"
            : "bg-muted text-muted-foreground font-medium"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];

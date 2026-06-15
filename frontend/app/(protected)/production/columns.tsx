"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProductionProduct } from "@/services/production.service";

export const columns: ColumnDef<ProductionProduct>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "gujaratiName",
    header: "Gujarati Name",
    cell: ({ row }) => {
      const name = row.getValue("gujaratiName") as string;
      return name ? <span className="font-gujarati">{name}</span> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Required Quantity",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "currentStock",
    header: "Current Stock",
  },
  {
    accessorKey: "remainingAfterProduction",
    header: "Remaining After Production",
    cell: ({ row }) => {
      const remaining = row.getValue("remainingAfterProduction") as number;
      return (
        <span className={remaining < 0 ? "text-destructive font-medium" : ""}>
          {remaining}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      if (status === "READY") {
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
            Ready
          </Badge>
        );
      }
      
      return (
        <Badge variant="destructive">
          Low Stock
        </Badge>
      );
    },
  },
];

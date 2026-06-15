"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { InventorySummary } from "@/services/inventory.service";

interface InventoryColumnsProps {
  onAdjustStock: (product: InventorySummary) => void;
  onViewHistory: (product: InventorySummary) => void;
}

export const getColumns = ({ onAdjustStock, onViewHistory }: InventoryColumnsProps): ColumnDef<InventorySummary>[] => [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("unit")}</div>
    ),
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const stock = row.getValue("availableStock") as number;
      const unit = row.original.unit;
      return (
        <div className="font-semibold">
          {stock} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "reservedStock",
    header: "Reserved Stock",
    cell: ({ row }) => {
      const stock = row.getValue("reservedStock") as number;
      const unit = row.original.unit;
      return (
        <div className="text-muted-foreground">
          {stock} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const product = row.original;
      if (product.availableStock <= 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (product.isLowStock) {
        return <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950">Low Stock</Badge>;
      }
      return <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950">Safe</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Adjust Stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewHistory(product)}>
                  <FileText className="mr-2 h-4 w-4" /> View History
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

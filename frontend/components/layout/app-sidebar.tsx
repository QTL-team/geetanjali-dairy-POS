"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  CreditCard,
  Settings,
  Factory,
  Box,
  BarChart
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Inventory", href: "/inventory", icon: Box },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Bills", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r border-sidebar-border bg-sidebar md:block w-64 lg:w-72 shrink-0 shadow-sm h-full overflow-y-auto z-10">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="text-lg">Geetanjali Dairy</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-base font-medium lg:px-4 gap-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors", 
                    isActive ? "text-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="grid items-start text-base font-medium">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-all group",
                pathname.startsWith("/settings") 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Settings className={cn(
                "h-5 w-5 transition-colors",
                pathname.startsWith("/settings") ? "text-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
              )} />
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

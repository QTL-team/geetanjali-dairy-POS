"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  CircleUser, 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  CreditCard,
  Settings,
  Factory,
  Box
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Inventory", href: "/inventory", icon: Box },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" size="icon" className="shrink-0 md:hidden" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-[300px] sm:w-[350px]">
          <nav className="grid gap-2 text-lg font-medium pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold mb-6 text-primary"
            >
              <Package className="h-6 w-6" />
              <span>Geetanjali Dairy</span>
            </Link>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pb-4">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                  pathname.startsWith("/settings")
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Can add search here if needed */}
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="rounded-full" />}>
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

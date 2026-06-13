import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[16rem_1fr] lg:grid-cols-[18rem_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <AppNavbar />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}

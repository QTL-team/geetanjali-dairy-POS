import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";
import { PageTransition } from "./page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <AppNavbar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 xl:p-10 bg-muted/30">
          <PageTransition>
            <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col">
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

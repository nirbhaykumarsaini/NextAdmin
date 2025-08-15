"use client";

import { usePathname } from 'next/navigation';
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {Sidebar} from "@/components/shared/Sidebar";
import { ThemeProvider } from "@/providers/theme-provider";
import { Breadcrumb } from '../ui/breadcrumb';
import { Toaster } from "@/components/ui/sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <div className="flex h-screen overflow-hidden">
          <Breadcrumb />
          {pathname !== "/" && <Sidebar />}

          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {pathname !== "/" && <Header />}

            <main className={pathname !== "/" ? `flex-1 p-4` : `p-0 md:pl-0`}>
              <div className={`rounded-xl bg-white dark:bg-gray-900 ${pathname !== "/" ? "p-4 md:p-6 " : "p-0 md:p-0"} shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-300`}>
                {children}
              </div>
            </main>

            {pathname !== "/" && <Footer />}
          </div>
        </div>
        <Toaster />
    </ThemeProvider>
  );
}
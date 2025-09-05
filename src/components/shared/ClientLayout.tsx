"use client";

import { usePathname } from 'next/navigation';
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Sidebar } from "@/components/shared/Sidebar";
import { ThemeProvider } from "@/providers/theme-provider";
import { Breadcrumb } from '../ui/breadcrumb';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from '@/providers/auth-provider';
import { useAppSelector } from '@/hooks/redux';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isAuthPage = pathname === '/';
  const showLayout = isAuthenticated && !isAuthPage;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>
        <div className="flex h-screen overflow-hidden">
          {showLayout && <Breadcrumb />}
          {showLayout && <Sidebar />}

          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {showLayout && <Header />}

            <main className={showLayout ? `flex-1 p-4` : `p-0 md:pl-0`}>
              <div className={`rounded-xl bg-white dark:bg-gray-900 ${showLayout ? "p-4 md:p-6 " : "p-0 md:p-0"} shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-300`}>
                {children}

              </div>
            </main>

            {showLayout && <Footer />}
          </div>
        </div>
        <Toaster />
      </Providers>
    </ThemeProvider>
  );
}
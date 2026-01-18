"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { MainNav } from "@/components/main-nav";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {isLoginPage ? (
            // Login page without sidebar/nav
            <main>{children}</main>
          ) : (
            // Authenticated pages with sidebar/nav
            <div className="flex min-h-screen flex-col md:flex-row">
              <Sidebar />
              <div className="flex-1">
                <MainNav />
                <main className="p-4 pb-20 md:p-6 md:pb-6">
                  {children}
                </main>
              </div>
              <BottomNav />
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

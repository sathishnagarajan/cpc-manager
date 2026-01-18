"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CPC Admin - Chennai Physio Care Management</title>
      </head>
      <body className="antialiased">
        {isLoginPage ? (
          <main>{children}</main>
        ) : (
          <div className="flex min-h-screen">
            <aside className="w-64 border-r bg-gray-50">
              {/* Sidebar will go here */}
            </aside>
            <div className="flex-1">
              <main className="p-6">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

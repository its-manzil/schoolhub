import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SchoolHub",
  description: "Advanced School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden w-full`} suppressHydrationWarning>
        <ToastProvider>
          <div className="flex w-full overflow-x-hidden">
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
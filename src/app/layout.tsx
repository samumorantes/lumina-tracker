import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import BottomNav from "@/components/BottomNav";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina - Habit Tracker",
  description: "Construye tu mejor versión con seguimiento inteligente y analíticas detalladas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-500 ease-out`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthProvider>
            <BottomNav />
            <main className="pb-24 md:pb-0 md:pl-24 min-h-screen">
              {children}
            </main>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

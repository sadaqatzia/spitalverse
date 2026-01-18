import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Spitalverse - Your Personal Health Companion",
  description: "Manage your health records, medications, appointments, and get AI-powered health insights. Your data, your control.",
  keywords: "health, medical records, medications, appointments, health tracking, AI health summary",
  authors: [{ name: "Spitalverse" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-72 min-h-screen p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
